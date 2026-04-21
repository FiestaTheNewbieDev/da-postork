import { AbstractArticle } from '@entities/abstract-article.entity';
import { GundamOfficialArticle } from '@entities/gundam-official-article.entity';
import { MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { AbstractSourceService } from '@sources/core/abstract-source-service';
import { GundamOfficialApi } from '@sources/gundam-official/gundam-official.api';
import * as Constants from '@sources/gundam-official/gundam-official.constants';
import { GundamOfficialSource } from '@sources/gundam-official/gundam-official.source';
import * as Types from '@sources/gundam-official/gundam-official.types';
import { SourceJobData } from '@sources/sources.types';
import { Queue } from 'bullmq';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class GundamOfficialService extends AbstractSourceService<
  AbstractArticle,
  unknown
> {
  constructor(
    source: GundamOfficialSource,
    private readonly api: GundamOfficialApi,
    @InjectRepository(GundamOfficialArticle)
    private readonly articleRepo: EntityRepository<GundamOfficialArticle>,
    orm: MikroORM,
    subscriptionService: SubscriptionService,
    @InjectQueue(Constants.GUNDAM_OFFICIAL_QUEUE)
    queue: Queue<SourceJobData>,
  ) {
    super(source, orm, subscriptionService, queue);
  }

  protected async getUnsavedNews(): Promise<Types.News[]> {
    const { data: news } = await this.api.getNews();

    const existing = await this.articleRepo.find({
      gundamOfficialDocumentId: { $in: news.map((n) => n.documentId) },
    });

    return news.filter(
      (n) => !existing.some((e) => e.gundamOfficialDocumentId === n.documentId),
    );
  }

  protected async saveNews(
    news: Types.News[],
  ): Promise<GundamOfficialArticle[]> {
    const articles = news.map((n) =>
      this.articleRepo.create({
        gundamOfficialDocumentId: n.documentId,
        gundamOfficialSlug: n.slug,
        title: n.title,
        thumbnailUrl: n.thumbnail.url,
        publishedAt: new Date(n.displayDatetime),
      }),
    );

    await this.articleRepo.getEntityManager().flush();

    return articles;
  }

  public getArticlesByIds(ids: number[]): Promise<GundamOfficialArticle[]> {
    return this.articleRepo.find(
      { id: { $in: ids } },
      { orderBy: { publishedAt: 'asc' } },
    );
  }

  public buildEmbed(article: GundamOfficialArticle): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(article.title)
      .setImage(article.thumbnailUrl)
      .setURL(GundamOfficialService.buildArticleUrl(article))
      .addFields({ name: '​', value: article.publishedAt.toDateString() });
  }

  public static buildArticleUrl(article: GundamOfficialArticle): string {
    return new URL(
      `news/${article.gundamOfficialDocumentId}`,
      Constants.GUNDAM_OFFICIAL_WEBSITE_BASE_URL,
    ).toString();
  }
}
