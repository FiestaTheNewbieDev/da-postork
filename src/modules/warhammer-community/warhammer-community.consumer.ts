import * as Permissions from '@modules/discord/constants/permissions';
import { DiscordClientService } from '@modules/discord/services/discord-client.service';
import * as Constants from '@modules/warhammer-community/warhammer-community.constants';
import { WarhammerCommunityService } from '@modules/warhammer-community/warhammer-community.service';
import * as Types from '@modules/warhammer-community/warhammer-community.types';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { GuildChannel, Message } from 'discord.js';

@Processor(Constants.WARHAMMER_COMMUNITY_QUEUE, {
  concurrency: 4,
})
export class WarhammerCommunityConsumer extends WorkerHost {
  private readonly logger = new Logger(WarhammerCommunityConsumer.name);

  constructor(
    private readonly discordClientService: DiscordClientService,
    private readonly warhammerCommunityService: WarhammerCommunityService,
  ) {
    super();
  }

  async process(job: Job<Types.WarhammerCommunityJobData>): Promise<void> {
    const { channelId, articleIds } = job.data;

    this.logger.log(
      `Processing job for channel ${channelId} with article IDs: ${articleIds.join(', ')}`,
    );

    const channel = this.discordClientService.getChannel(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    if (!channel.isSendable())
      throw new Error(`Channel ${channelId} is not sendable`);

    if (
      channel instanceof GuildChannel &&
      !channel
        .permissionsFor(this.discordClientService.client.user!)
        ?.has(Permissions.SEND_EMBED)
    ) {
      throw new Error(
        `Missing permissions to send embeds in channel ${channelId}`,
      );
    }

    const articles = (
      await this.warhammerCommunityService.getArticlesByIds(articleIds)
    ).sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());

    for (const article of articles) {
      try {
        await channel
          .send({
            embeds: [WarhammerCommunityService.buildArticleEmbed(article)],
          })
          .then((message: Message) => {
            if (
              channel instanceof GuildChannel &&
              !channel
                .permissionsFor(this.discordClientService.client.user!)
                ?.has(Permissions.ADD_REACTIONS)
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
          `Failed to send article ${article.id} to channel ${channelId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }
}
