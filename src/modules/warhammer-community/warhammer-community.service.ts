import { WarhammerCommunityArticle } from '@entities/warhammer-community-article.entity';
import { EntityManager } from '@mikro-orm/core';
import { DiscordClientService } from '@modules/discord/services/discord-client.service';
import { WarhammerCommunityApi } from '@modules/warhammer-community/warhammer-community.api';
import * as Constants from '@modules/warhammer-community/warhammer-community.constants';
import * as Types from '@modules/warhammer-community/warhammer-community.types';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class WarhammerCommunityService implements OnModuleInit {
  private readonly logger = new Logger(WarhammerCommunityService.name);

  constructor(
    private readonly api: WarhammerCommunityApi,
    private readonly em: EntityManager,
    private readonly discordClientService: DiscordClientService,
    @InjectQueue(Constants.WARHAMMER_COMMUNITY_QUEUE)
    private readonly queue: Queue<Types.WarhammerCommunityJobData>,
  ) {}

  onModuleInit() {
    void this.handleCron();
  }

  private async getUnsavedNews(em: EntityManager): Promise<Types.News[]> {
    const { news } = await this.api.getNews();

    const existing = await em.find(WarhammerCommunityArticle, {
      $and: [
        { warhammerCommunityId: { $in: news.map((n) => n.id) } },
        { warhammerCommunityUuid: { $in: news.map((n) => n.uuid) } },
      ],
    });

    const existingCombos = new Set(
      existing.map(
        (a) => `${a.warhammerCommunityId}__${a.warhammerCommunityUuid}`,
      ),
    );

    return news.filter((n) => !existingCombos.has(`${n.id}__${n.uuid}`));
  }

  private async saveNews(
    em: EntityManager,
    news: Types.News[],
  ): Promise<WarhammerCommunityArticle[]> {
    const articles = news.map((n) =>
      em.create(WarhammerCommunityArticle, {
        warhammerCommunityId: n.id,
        warhammerCommunityUuid: n.uuid,
        warhammerCommunitySlug: n.slug,
        title: n.title,
        excerpt: n.excerpt,
        locale: n.site,
        thumbnailPath: n.image?.path || null,
        publishedAt: new Date(n.date),
      }),
    );

    await em.persist(articles).flush();

    return articles;
  }

  @Cron(CronExpression.EVERY_HOUR)
  private async handleCron() {
    const em = this.em.fork();
    const unsavedNews = await this.getUnsavedNews(em);

    if (unsavedNews.length === 0) {
      this.logger.log('No new articles');
      return;
    }

    const articles = await this.saveNews(em, unsavedNews);

    this.logger.log(`Saved ${articles.length} new article(s)`);

    const channelIds = this.discordClientService
      .getTextChannels()
      .map((channel) => channel.id);
    const articleIds = articles.map((a) => a.id as number);

    const jobs = channelIds.map((channelId) => ({
      name: channelId,
      data: { channelId, articleIds } as Types.WarhammerCommunityJobData,
    }));

    await this.queue.addBulk(jobs);
    this.logger.log(
      `Enqueued ${jobs.length} job(s) for ${articles.length} article(s)`,
    );
  }

  public async getArticlesByIds(
    ids: number[],
  ): Promise<WarhammerCommunityArticle[]> {
    return this.em.fork().find(WarhammerCommunityArticle, { id: { $in: ids } });
  }

  public static buildArticleUrl(article: WarhammerCommunityArticle): string {
    return `https://www.warhammer-community.com/${article.locale}/articles/${article.warhammerCommunityUuid}/${article.warhammerCommunitySlug}/`;
  }

  public static buildAssetUrl(assetPath: string): string {
    return `https://assets.warhammer-community.com/${assetPath}`;
  }

  public static buildArticleEmbed(
    article: WarhammerCommunityArticle,
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(article.title)
      .setDescription(article.excerpt || null)
      .setImage(
        article.thumbnailPath
          ? WarhammerCommunityService.buildAssetUrl(article.thumbnailPath)
          : null,
      )
      .setURL(WarhammerCommunityService.buildArticleUrl(article))
      .addFields({ name: '\u200B', value: article.publishedAt.toDateString() });
  }
}
