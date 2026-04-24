import { SourceId } from '@entities/subscription.entity';
import { WarhammerCommunityArticle } from '@entities/warhammer-community-article.entity';
import { warhammerCommunityArticleFactory } from '@factories/warhammer-community-article.factory';
import { MikroORM } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Source } from '@sources/core/source';
import { SourceJobData } from '@sources/sources.types';
import { WarhammerCommunityApi } from '@sources/warhammer-community/warhammer-community.api';
import { WarhammerCommunityService } from '@sources/warhammer-community/warhammer-community.service';
import * as Types from '@sources/warhammer-community/warhammer-community.types';
import { Queue } from 'bullmq';

jest.mock('@mikro-orm/core', () => ({
  ...jest.requireActual<typeof import('@mikro-orm/core')>('@mikro-orm/core'),
  CreateRequestContext:
    () => (_t: object, _k: string | symbol, d: PropertyDescriptor) =>
      d,
}));

describe(WarhammerCommunityService.name, () => {
  let service: WarhammerCommunityService;
  let api: { getNews: jest.Mock };
  let articleRepo: {
    find: jest.Mock;
    create: jest.Mock;
    getEntityManager: jest.Mock;
  };
  let em: { flush: jest.Mock };

  const makeNews = (
    id: string,
    uuid: string,
    overrides?: Partial<Types.News>,
  ): Types.News => ({
    id,
    uuid,
    title: `Article ${id}`,
    slug: `article-${id}`,
    excerpt: 'Excerpt',
    site: 'en-gb',
    image: { path: 'image.jpg', alt: null, width: 100, height: 100, focus: '' },
    collection: 'articles',
    game_system: {} as Types.GameSystem,
    topics: [],
    date: '2024-01-01',
    hide_date: false,
    hide_read_time: false,
    interaction_time: '5 min',
    uri: '/articles/id',
    ...overrides,
  });

  beforeEach(() => {
    Source.register(
      new Source(SourceId.WarhammerCommunity, {
        label: 'Warhammer Community',
        description: null,
        url: null,
      }),
    );

    em = { flush: jest.fn().mockResolvedValue(undefined) };
    articleRepo = {
      find: jest.fn(),
      create: jest.fn(),
      getEntityManager: jest.fn().mockReturnValue(em),
    };
    api = { getNews: jest.fn() };

    service = new WarhammerCommunityService(
      api as unknown as WarhammerCommunityApi,
      articleRepo as unknown as EntityRepository<WarhammerCommunityArticle>,
      {} as MikroORM,
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
          getUnsavedNews: () => Promise<Types.News[]>;
        }
      ).getUnsavedNews();

    it('should return all news when none are saved', async () => {
      const news = [makeNews('1', 'uuid-1'), makeNews('2', 'uuid-2')];
      api.getNews.mockResolvedValue({ news });
      articleRepo.find.mockResolvedValue([]);

      expect(await getUnsavedNews()).toEqual(news);
    });

    it('should filter out already saved news', async () => {
      const news = [makeNews('1', 'uuid-1'), makeNews('2', 'uuid-2')];
      api.getNews.mockResolvedValue({ news });
      articleRepo.find.mockResolvedValue([
        { warhammerCommunityId: '1', warhammerCommunityUuid: 'uuid-1' },
      ]);

      expect(await getUnsavedNews()).toEqual([news[1]]);
    });

    it('should return an empty array when all news are already saved', async () => {
      const news = [makeNews('1', 'uuid-1')];
      api.getNews.mockResolvedValue({ news });
      articleRepo.find.mockResolvedValue([
        { warhammerCommunityId: '1', warhammerCommunityUuid: 'uuid-1' },
      ]);

      expect(await getUnsavedNews()).toEqual([]);
    });
  });

  describe('saveNews', () => {
    const saveNews = (news: Types.News[]) =>
      (
        service as unknown as {
          saveNews: (n: Types.News[]) => Promise<WarhammerCommunityArticle[]>;
        }
      ).saveNews(news);

    it('should create articles and flush', async () => {
      const newsItem = makeNews('1', 'uuid-1');
      const article = warhammerCommunityArticleFactory();
      articleRepo.create.mockReturnValue(article);

      const result = await saveNews([newsItem]);

      expect(articleRepo.create).toHaveBeenCalledWith({
        warhammerCommunityId: newsItem.id,
        warhammerCommunityUuid: newsItem.uuid,
        warhammerCommunitySlug: newsItem.slug,
        title: newsItem.title,
        excerpt: newsItem.excerpt,
        locale: newsItem.site,
        thumbnailPath: newsItem.image.path,
        publishedAt: new Date(newsItem.date),
      });
      expect(em.flush).toHaveBeenCalled();
      expect(result).toEqual([article]);
    });

    it('should set thumbnailPath to null when image is absent', async () => {
      const newsItem = makeNews('1', 'uuid-1', {
        image: undefined as unknown as Types.Image,
      });
      articleRepo.create.mockReturnValue({});

      await saveNews([newsItem]);

      expect(articleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ thumbnailPath: null }),
      );
    });
  });

  describe('getArticlesByIds', () => {
    it('should find articles by ids ordered by publishedAt asc', async () => {
      const articles = [warhammerCommunityArticleFactory()];
      articleRepo.find.mockResolvedValue(articles);

      const result = await service.getArticlesByIds([1, 2]);

      expect(articleRepo.find).toHaveBeenCalledWith(
        { id: { $in: [1, 2] } },
        { orderBy: { publishedAt: 'asc' } },
      );
      expect(result).toEqual(articles);
    });
  });
});
