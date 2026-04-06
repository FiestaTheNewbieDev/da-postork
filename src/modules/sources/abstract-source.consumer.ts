import { AbstractArticle } from '@entities/abstract-article.entity';
import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import * as DiscordConstants from '@modules/discord/discord.constants';
import { WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AbstractSourceService } from '@sources/abstract-source.service';
import * as Constants from '@sources/sources.constants';
import * as Types from '@sources/sources.types';
import { Job } from 'bullmq';
import { Client, GuildChannel, Message } from 'discord.js';

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

  @OnEvent('bot.ready')
  onBotReady() {
    this.worker.resume();
  }

  @CreateRequestContext()
  async process(job: Job<Types.SourceJobData>): Promise<void> {
    const { channelId, articleIds } = job.data;

    this.logger.log(Constants.MESSAGES.processJob(channelId, articleIds));

    const channel = this.client.channels.cache.get(channelId) ?? null;
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
        await channel
          .send({ embeds: [this.sourceService.buildEmbed(article)] })
          .then((message: Message) => {
            if (
              channel instanceof GuildChannel &&
              !channel
                .permissionsFor(this.client.user!)
                ?.has(DiscordConstants.ADD_REACTIONS)
            )
              return;
            void Promise.all([
              message.react('👍'),
              message.react('😐'),
              message.react('👎'),
            ]);
          });
      } catch (error) {
        throw new Error(
          Constants.ERROR_MESSAGES.sendMessageFailed(channelId, article.id),
          { cause: error },
        );
      }
    }
  }
}
