import { EVENTS } from '@constants/events';
import { AbstractArticle } from '@entities/abstract-article.entity';
import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import * as DiscordConstants from '@modules/discord/discord.constants';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit, Type } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AbstractSourceService } from '@sources/core/abstract-source-service';
import * as Constants from '@sources/sources.constants';
import * as Types from '@sources/sources.types';
import { Job } from 'bullmq';
import { Client, GuildChannel } from 'discord.js';

export function createSourceConsumer<TArticle extends AbstractArticle>(
  queueName: string,
  serviceType: Type<AbstractSourceService<TArticle>>,
  concurrency = 4,
): Type<AbstractSourceConsumer<TArticle>> {
  @Processor(queueName, { concurrency })
  class SourceConsumer extends AbstractSourceConsumer<TArticle> {
    constructor(
      orm: MikroORM,
      client: Client,
      service: AbstractSourceService<TArticle>,
    ) {
      super(orm, client, service);
    }
  }
  Reflect.defineMetadata(
    'design:paramtypes',
    [MikroORM, Client, serviceType],
    SourceConsumer,
  );
  return SourceConsumer;
}

export abstract class AbstractSourceConsumer<TArticle extends AbstractArticle>
  extends WorkerHost
  implements OnModuleInit
{
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly orm: MikroORM,
    protected readonly client: Client,
    protected readonly sourceService: AbstractSourceService<TArticle>,
  ) {
    super();
  }

  onModuleInit() {
    void this.worker.pause();
  }

  @OnEvent(EVENTS.discordClientReady)
  onBotReady() {
    this.worker.resume();
  }

  @CreateRequestContext()
  async process(job: Job<Types.SourceJobData>): Promise<void> {
    const { channelId, articleIds } = job.data;

    this.logger.log(Constants.MESSAGES.processJob(channelId, articleIds));

    const channel =
      this.client.channels.cache.get(channelId) ??
      (await this.client.channels.fetch(channelId).catch(() => null));
    if (!channel)
      throw new Error(Constants.ERROR_MESSAGES.channelNotFound(channelId));
    if (!channel.isSendable())
      throw new Error(Constants.ERROR_MESSAGES.channelNotSendable(channelId));

    if (
      channel instanceof GuildChannel &&
      !channel
        .permissionsFor(this.client.user!)
        ?.has(DiscordConstants.SEND_EMBED)
    ) {
      throw new Error(
        Constants.ERROR_MESSAGES.missingEmbedPermissions(channelId),
      );
    }

    const articles = await this.sourceService.getArticlesByIds(articleIds);

    for (const article of articles) {
      try {
        const message = await channel.send({
          embeds: [this.sourceService.buildEmbed(article)],
        });

        if (
          channel instanceof GuildChannel &&
          !channel
            .permissionsFor(this.client.user!)
            ?.has(DiscordConstants.ADD_REACTIONS)
        )
          return;

        void Promise.all(
          this.sourceService.getReactions().map((r) => message.react(r)),
        );
      } catch (error) {
        throw new Error(
          Constants.ERROR_MESSAGES.sendMessageFailed(channelId, article.id),
          { cause: error },
        );
      }
    }
  }
}
