import {
  CodexYGOArticle,
  CodexYGOCategory,
  CodexYGOMember,
} from '@entities/codexygo';
import { SourceId } from '@entities/subscription.entity';
import { MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CodexYGOApi } from '@sources/codexygo/codexygo.api';
import * as Constants from '@sources/codexygo/codexygo.constants';
import * as Types from '@sources/codexygo/codexygo.types';
import { AbstractSourceService } from '@sources/core/abstract-source-service';
import { Source } from '@sources/core/source';
import { SourceJobData } from '@sources/sources.types';
import { Queue } from 'bullmq';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class CodexYGOService extends AbstractSourceService<
  CodexYGOArticle,
  Types.Article
> {
  constructor(
    private readonly api: CodexYGOApi,
    @InjectRepository(CodexYGOArticle)
    private readonly articleRepo: EntityRepository<CodexYGOArticle>,
    @InjectRepository(CodexYGOCategory)
    private readonly categoryRepo: EntityRepository<CodexYGOCategory>,
    @InjectRepository(CodexYGOMember)
    private readonly memberRepo: EntityRepository<CodexYGOMember>,
    orm: MikroORM,
    subscriptionService: SubscriptionService,
    @InjectQueue(Constants.CODEXYGO_QUEUE)
    queue: Queue<SourceJobData>,
    schedulerRegistry: SchedulerRegistry,
  ) {
    super(orm, subscriptionService, queue, schedulerRegistry);
  }

  protected get schedules() {
    return [
      { expression: '0 22-23 * * *', timezone: 'Europe/Paris' },
      { expression: '0 0-7 * * *', timezone: 'Europe/Paris' },
      { expression: '*/30 8-21 * * *', timezone: 'Europe/Paris' },
    ];
  }

  protected get source(): Source {
    return Source.resolve(SourceId.CodexYGO);
  }

  protected async getUnsavedNews(): Promise<Types.Article[]> {
    const { articleRecord, categoryRecord, memberRecord } =
      await this.api.getNews(1);

    const [existingArticles, existingCategories, existingMembers] =
      await Promise.all([
        this.articleRepo.find({
          codexygoOid: { $in: Object.values(articleRecord).map((a) => a.oid) },
        }),
        this.categoryRepo.find({
          codexygoOid: { $in: Object.values(categoryRecord).map((c) => c.oid) },
        }),
        this.memberRepo.find({
          codexygoOid: { $in: Object.values(memberRecord).map((m) => m.oid) },
        }),
      ]);

    const existingCategoryOids = new Set(
      existingCategories.map((c) => c.codexygoOid),
    );
    Object.values(categoryRecord)
      .filter((c) => !existingCategoryOids.has(c.oid))
      .forEach((c) =>
        this.categoryRepo.create({
          codexygoOid: c.oid,
          name: c.name,
          path: c.path,
        }),
      );

    const existingMemberOids = new Set(
      existingMembers.map((m) => m.codexygoOid),
    );
    Object.values(memberRecord)
      .filter((m) => !existingMemberOids.has(m.oid))
      .forEach((m) =>
        this.memberRepo.create({ codexygoOid: m.oid, username: m.userName }),
      );

    await this.orm.em.flush();

    const existingArticleOids = new Set(
      existingArticles.map((a) => a.codexygoOid),
    );
    return Object.values(articleRecord).filter(
      (a) => !existingArticleOids.has(a.oid),
    );
  }

  protected async saveNews(news: Types.Article[]): Promise<CodexYGOArticle[]> {
    const allCategoryIds = [...new Set(news.flatMap((n) => n.categories))];
    const allMemberIds = [...new Set(news.map((n) => n.creator))];

    const [categories, members] = await Promise.all([
      this.categoryRepo.find({ codexygoOid: { $in: allCategoryIds } }),
      this.memberRepo.find({ codexygoOid: { $in: allMemberIds } }),
    ]);

    const categoryByOid = new Map(categories.map((c) => [c.codexygoOid, c]));
    const memberByOid = new Map(members.map((m) => [m.codexygoOid, m]));

    const articles = news.map((n) =>
      this.articleRepo.create({
        codexygoOid: n.oid,
        codexygoSlug: n.slug,
        title: n.title,
        teaser: n.teaser,
        thumbnailId: n.thumbnail,
        tags: n.tags,
        creator: memberByOid.get(n.creator)!,
        categories: n.categories.map((oid) => categoryByOid.get(oid)!),
        publishedAt: new Date(n.publishDate),
      }),
    );

    await this.articleRepo.getEntityManager().flush();

    return articles;
  }

  public getArticlesByIds(ids: number[]): Promise<CodexYGOArticle[]> {
    return this.articleRepo.find(
      { id: { $in: ids } },
      { populate: ['creator', 'categories'], orderBy: { publishedAt: 'asc' } },
    );
  }

  public static buildArticleUrl(article: CodexYGOArticle): string {
    const url = new URL(Constants.CODEXYGO_WEBSITE_BASE_URL);
    url.pathname = `/article/${article.codexygoSlug}-${article.codexygoOid}/`;
    return url.toString();
  }

  public static buildAssetUrl(assetId: number): string {
    return `${Constants.CODEXYGO_WEBSITE_BASE_URL}/api/file/download/1/${assetId}/?derivative=webp`;
  }

  public buildEmbed(article: CodexYGOArticle): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(article.title)
      .setDescription(article.teaser || null)
      .setAuthor({
        name: article.creator.username,
      })
      .setImage(
        article.thumbnailId
          ? CodexYGOService.buildAssetUrl(article.thumbnailId)
          : null,
      )
      .setURL(CodexYGOService.buildArticleUrl(article))
      .addFields({ name: '\u200B', value: article.publishedAt.toDateString() });
  }
}
