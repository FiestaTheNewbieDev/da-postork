import { SourceId } from '@entities/subscription.entity';
import { WarhammerCommunityArticle } from '@entities/warhammer-community-article.entity';
import { MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AbstractSourceService } from '@sources/core/abstract-source-service';
import { Source } from '@sources/core/source';
import { SourceJobData } from '@sources/sources.types';
import { WarhammerCommunityApi } from '@sources/warhammer-community/warhammer-community.api';
import * as Constants from '@sources/warhammer-community/warhammer-community.constants';
import * as Types from '@sources/warhammer-community/warhammer-community.types';
import { Queue } from 'bullmq';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class WarhammerCommunityService extends AbstractSourceService<
  WarhammerCommunityArticle,
  Types.News
> {
  constructor(
    private readonly api: WarhammerCommunityApi,
    @InjectRepository(WarhammerCommunityArticle)
    private readonly articleRepo: EntityRepository<WarhammerCommunityArticle>,
    orm: MikroORM,
    subscriptionService: SubscriptionService,
    @InjectQueue(Constants.WARHAMMER_COMMUNITY_QUEUE)
    queue: Queue<SourceJobData>,
    schedulerRegistry: SchedulerRegistry,
  ) {
    super(orm, subscriptionService, queue, schedulerRegistry);
  }

  protected get schedules() {
    return [
      { expression: '0 22-23 * * *', timezone: 'Europe/London' },
      { expression: '0 0-7 * * *', timezone: 'Europe/London' },
      { expression: '*/30 8-21 * * *', timezone: 'Europe/London' },
    ];
  }

  protected get source(): Source {
    return Source.resolve(SourceId.WarhammerCommunity);
  }

  protected async getUnsavedNews(): Promise<Types.News[]> {
    const { news } = await this.api.getNews();

    const existing = await this.articleRepo.find({
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

  protected async saveNews(
    news: Types.News[],
  ): Promise<WarhammerCommunityArticle[]> {
    const articles = news.map((n) =>
      this.articleRepo.create({
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

    await this.articleRepo.getEntityManager().flush();

    return articles;
  }

  public getArticlesByIds(ids: number[]): Promise<WarhammerCommunityArticle[]> {
    return this.articleRepo.find(
      { id: { $in: ids } },
      { orderBy: { publishedAt: 'asc' } },
    );
  }

  public static buildArticleUrl(article: WarhammerCommunityArticle): string {
    const url = new URL(Constants.WARHAMMER_COMMUNITY_WEBSITE_BASE_URL);
    url.pathname = `/${article.locale}/articles/${article.warhammerCommunityUuid}/${article.warhammerCommunitySlug}/`;
    return url.toString();
  }

  public static buildAssetUrl(assetPath: string): string {
    return new URL(
      assetPath,
      'https://assets.warhammer-community.com',
    ).toString();
  }

  public buildEmbed(article: WarhammerCommunityArticle): EmbedBuilder {
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
