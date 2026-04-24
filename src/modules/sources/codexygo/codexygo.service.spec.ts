import {
  CodexYGOArticle,
  CodexYGOCategory,
  CodexYGOMember,
} from '@entities/codexygo';
import { SourceId } from '@entities/subscription.entity';
import { codexygoArticleFactory } from '@factories/codexygo-article.factory';
import { codexyGoCategoryFactory } from '@factories/codexygo-category.factory';
import { codexygoMemberFactory } from '@factories/codexygo-member.factory';
import { MikroORM } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CodexYGOApi } from '@sources/codexygo/codexygo.api';
import * as Constants from '@sources/codexygo/codexygo.constants';
import { CodexYGOService } from '@sources/codexygo/codexygo.service';
import * as Types from '@sources/codexygo/codexygo.types';
import { Source } from '@sources/core/source';
import { SourceJobData } from '@sources/sources.types';
import { Queue } from 'bullmq';

jest.mock('@mikro-orm/core', () => ({
  ...jest.requireActual<typeof import('@mikro-orm/core')>('@mikro-orm/core'),
  CreateRequestContext:
    () => (_t: object, _k: string | symbol, d: PropertyDescriptor) =>
      d,
}));

describe(CodexYGOService.name, () => {
  let service: CodexYGOService;
  let api: { getNews: jest.Mock };
  let articleRepo: {
    find: jest.Mock;
    create: jest.Mock;
    getEntityManager: jest.Mock;
  };
  let categoryRepo: { find: jest.Mock; create: jest.Mock };
  let memberRepo: { find: jest.Mock; create: jest.Mock };
  let em: { flush: jest.Mock };
  let orm: { em: { flush: jest.Mock } };

  const makeArticleData = (
    overrides?: Partial<Types.Article>,
  ): Types.Article => ({
    oid: 1,
    slug: 'article-slug',
    title: 'Article Title',
    teaser: 'Article teaser',
    thumbnail: 10,
    tags: [],
    cards: [],
    categories: [],
    cardRulings: [],
    thumbnailEffects: [],
    creator: 1,
    publishDate: new Date('2024-01-01'),
    changed: new Date('2024-01-01'),
    created: new Date('2024-01-01'),
    userChanged: new Date('2024-01-01'),
    applicationInstance: 1,
    ...overrides,
  });

  const makeCategoryData = (
    overrides?: Partial<Types.Category>,
  ): Types.Category => ({
    oid: 1,
    name: 'Category',
    path: '/category',
    pinned: false,
    weight: 0,
    changed: new Date('2024-01-01'),
    created: new Date('2024-01-01'),
    creator: 1,
    userChanged: new Date('2024-01-01'),
    applicationInstance: 1,
    ...overrides,
  });

  const makeMemberData = (overrides?: Partial<Types.Member>): Types.Member => ({
    oid: 1,
    userName: 'member',
    picture: 0,
    pictureEffects: [],
    applicationInstance: 1,
    roles: [],
    ...overrides,
  });

  const makeInitialServerData = (
    overrides?: Partial<Types.InitialServerData>,
  ): Types.InitialServerData => ({
    recentArticleCount: 0,
    recentArticleIds: [],
    pinnedCategoryIds: [],
    pinnedCategoryArticleIdsRecord: {},
    articleRecord: {},
    categoryRecord: {},
    memberRecord: {},
    ...overrides,
  });

  beforeEach(() => {
    Source.register(new Source(SourceId.CodexYGO, { label: 'CodexYGO' }));

    em = { flush: jest.fn().mockResolvedValue(undefined) };
    orm = { em: { flush: jest.fn().mockResolvedValue(undefined) } };
    articleRepo = {
      find: jest.fn(),
      create: jest.fn(),
      getEntityManager: jest.fn().mockReturnValue(em),
    };
    categoryRepo = { find: jest.fn(), create: jest.fn() };
    memberRepo = { find: jest.fn(), create: jest.fn() };
    api = { getNews: jest.fn() };

    service = new CodexYGOService(
      api as unknown as CodexYGOApi,
      articleRepo as unknown as EntityRepository<CodexYGOArticle>,
      categoryRepo as unknown as EntityRepository<CodexYGOCategory>,
      memberRepo as unknown as EntityRepository<CodexYGOMember>,
      orm as unknown as MikroORM,
      {} as SubscriptionService,
      {} as Queue<SourceJobData>,
      { addCronJob: jest.fn() } as unknown as SchedulerRegistry,
    );
  });

  afterEach(() => {
    Source.clearRegistry();
  });

  describe('getUnsavedNews', () => {
    const getUnsavedNews = () =>
      (
        service as unknown as {
          getUnsavedNews: () => Promise<Types.Article[]>;
        }
      ).getUnsavedNews();

    it('should return all articles when none are saved', async () => {
      const article = makeArticleData({ oid: 1 });
      api.getNews.mockResolvedValue(
        makeInitialServerData({ articleRecord: { '1': article } }),
      );
      articleRepo.find.mockResolvedValue([]);
      categoryRepo.find.mockResolvedValue([]);
      memberRepo.find.mockResolvedValue([]);

      expect(await getUnsavedNews()).toEqual([article]);
    });

    it('should filter out already saved articles', async () => {
      const article1 = makeArticleData({ oid: 1 });
      const article2 = makeArticleData({ oid: 2 });
      api.getNews.mockResolvedValue(
        makeInitialServerData({
          articleRecord: { '1': article1, '2': article2 },
        }),
      );
      articleRepo.find.mockResolvedValue([
        codexygoArticleFactory({ codexygoOid: 1 }),
      ]);
      categoryRepo.find.mockResolvedValue([]);
      memberRepo.find.mockResolvedValue([]);

      expect(await getUnsavedNews()).toEqual([article2]);
    });

    it('should return an empty array when all articles are already saved', async () => {
      const article = makeArticleData({ oid: 1 });
      api.getNews.mockResolvedValue(
        makeInitialServerData({ articleRecord: { '1': article } }),
      );
      articleRepo.find.mockResolvedValue([
        codexygoArticleFactory({ codexygoOid: 1 }),
      ]);
      categoryRepo.find.mockResolvedValue([]);
      memberRepo.find.mockResolvedValue([]);

      expect(await getUnsavedNews()).toEqual([]);
    });

    it('should create new categories that are not yet saved', async () => {
      const category = makeCategoryData({ oid: 10 });
      api.getNews.mockResolvedValue(
        makeInitialServerData({ categoryRecord: { '10': category } }),
      );
      articleRepo.find.mockResolvedValue([]);
      categoryRepo.find.mockResolvedValue([]);
      memberRepo.find.mockResolvedValue([]);

      await getUnsavedNews();

      expect(categoryRepo.create).toHaveBeenCalledWith({
        codexygoOid: category.oid,
        name: category.name,
        path: category.path,
      });
    });

    it('should not create categories that are already saved', async () => {
      const category = makeCategoryData({ oid: 10 });
      api.getNews.mockResolvedValue(
        makeInitialServerData({ categoryRecord: { '10': category } }),
      );
      articleRepo.find.mockResolvedValue([]);
      categoryRepo.find.mockResolvedValue([
        codexyGoCategoryFactory({ codexygoOid: 10 }),
      ]);
      memberRepo.find.mockResolvedValue([]);

      await getUnsavedNews();

      expect(categoryRepo.create).not.toHaveBeenCalled();
    });

    it('should create new members that are not yet saved', async () => {
      const member = makeMemberData({ oid: 20 });
      api.getNews.mockResolvedValue(
        makeInitialServerData({ memberRecord: { '20': member } }),
      );
      articleRepo.find.mockResolvedValue([]);
      categoryRepo.find.mockResolvedValue([]);
      memberRepo.find.mockResolvedValue([]);

      await getUnsavedNews();

      expect(memberRepo.create).toHaveBeenCalledWith({
        codexygoOid: member.oid,
        username: member.userName,
      });
    });

    it('should not create members that are already saved', async () => {
      const member = makeMemberData({ oid: 20 });
      api.getNews.mockResolvedValue(
        makeInitialServerData({ memberRecord: { '20': member } }),
      );
      articleRepo.find.mockResolvedValue([]);
      categoryRepo.find.mockResolvedValue([]);
      memberRepo.find.mockResolvedValue([
        codexygoMemberFactory({ codexygoOid: 20 }),
      ]);

      await getUnsavedNews();

      expect(memberRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('saveNews', () => {
    const saveNews = (news: Types.Article[]) =>
      (
        service as unknown as {
          saveNews: (n: Types.Article[]) => Promise<CodexYGOArticle[]>;
        }
      ).saveNews(news);

    it('should create articles with resolved category and member references', async () => {
      const category = codexyGoCategoryFactory({ codexygoOid: 5 });
      const member = codexygoMemberFactory({ codexygoOid: 3 });
      const newsItem = makeArticleData({
        oid: 1,
        categories: [5],
        creator: 3,
      });
      const article = codexygoArticleFactory();
      categoryRepo.find.mockResolvedValue([category]);
      memberRepo.find.mockResolvedValue([member]);
      articleRepo.create.mockReturnValue(article);

      const result = await saveNews([newsItem]);

      expect(articleRepo.create).toHaveBeenCalledWith({
        codexygoOid: newsItem.oid,
        codexygoSlug: newsItem.slug,
        title: newsItem.title,
        teaser: newsItem.teaser,
        thumbnailId: newsItem.thumbnail,
        tags: newsItem.tags,
        creator: member,
        categories: [category],
        publishedAt: new Date(newsItem.publishDate),
      });
      expect(em.flush).toHaveBeenCalled();
      expect(result).toEqual([article]);
    });
  });

  describe('getArticlesByIds', () => {
    it('should find articles by ids with creator and categories populated, ordered by publishedAt asc', async () => {
      const articles = [codexygoArticleFactory()];
      articleRepo.find.mockResolvedValue(articles);

      const result = await service.getArticlesByIds([1, 2]);

      expect(articleRepo.find).toHaveBeenCalledWith(
        { id: { $in: [1, 2] } },
        {
          populate: ['creator', 'categories'],
          orderBy: { publishedAt: 'asc' },
        },
      );
      expect(result).toEqual(articles);
    });
  });

  describe('buildEmbed', () => {
    it('should build the embed with all fields', () => {
      const article = codexygoArticleFactory({
        thumbnailId: 42,
        teaser: 'A teaser',
      });

      const embed = service.buildEmbed(article).toJSON();

      expect(embed.title).toBe(article.title);
      expect(embed.description).toBe(article.teaser);
      expect(embed.author?.name).toBe(article.creator.username);
      expect(embed.image?.url).toBe(
        CodexYGOService.buildAssetUrl(article.thumbnailId!),
      );
      expect(embed.url).toBe(
        (
          service as unknown as {
            buildArticleUrl: (a: CodexYGOArticle) => string;
          }
        ).buildArticleUrl(article),
      );
    });

    it('should set image to null when thumbnailId is absent', () => {
      const article = codexygoArticleFactory({ thumbnailId: undefined });

      const embed = service.buildEmbed(article).toJSON();

      expect(embed.image).toBeUndefined();
    });

    it('should set description to null when teaser is absent', () => {
      const article = codexygoArticleFactory({ teaser: undefined });

      const embed = service.buildEmbed(article).toJSON();

      expect(embed.description).toBeUndefined();
    });
  });

  describe('buildArticleUrl', () => {
    it('should build the correct article URL', () => {
      const article = codexygoArticleFactory({
        codexygoSlug: 'my-article',
        codexygoOid: 99,
      });

      const url = (
        service as unknown as {
          buildArticleUrl: (a: CodexYGOArticle) => string;
        }
      ).buildArticleUrl(article);

      expect(url).toBe(
        `${Constants.CODEXYGO_WEBSITE_BASE_URL}article/my-article-99/`,
      );
    });
  });

  describe('buildAssetUrl', () => {
    it('should build the correct asset URL', () => {
      const url = CodexYGOService.buildAssetUrl(123);

      expect(url).toBe(
        `${Constants.CODEXYGO_WEBSITE_BASE_URL}/api/file/download/1/123/?derivative=webp`,
      );
    });
  });
});
