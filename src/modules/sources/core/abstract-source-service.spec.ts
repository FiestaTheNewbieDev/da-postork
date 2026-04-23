import { AbstractArticle } from '@entities/abstract-article.entity';
import { SourceId } from '@entities/subscription.entity';
import { MikroORM } from '@mikro-orm/core';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AbstractSourceService } from '@sources/core/abstract-source-service';
import { Source } from '@sources/core/source';
import * as Constants from '@sources/sources.constants';
import { SourceJobData } from '@sources/sources.types';
import { Queue } from 'bullmq';
import { EmbedBuilder } from 'discord.js';

jest.mock('@mikro-orm/core', () => ({
  ...jest.requireActual<typeof import('@mikro-orm/core')>('@mikro-orm/core'),
  CreateRequestContext:
    () =>
    (_target: object, _key: string | symbol, descriptor: PropertyDescriptor) =>
      descriptor,
}));

class TestArticle extends AbstractArticle {}

class TestSourceService extends AbstractSourceService<TestArticle> {
  protected readonly source: Source;
  getUnsavedNews = jest.fn<Promise<unknown[]>, []>();
  saveNews = jest.fn<Promise<TestArticle[]>, [unknown[]]>();
  getArticlesByIds = jest.fn<Promise<TestArticle[]>, [number[]]>();
  buildEmbed = jest.fn<EmbedBuilder, [TestArticle]>();

  constructor(
    source: Source,
    orm: MikroORM,
    subscriptionService: SubscriptionService,
    queue: Queue<SourceJobData>,
    schedulerRegistry: SchedulerRegistry,
  ) {
    super(orm, subscriptionService, queue, schedulerRegistry);
    this.source = source;
  }
}

describe(AbstractSourceService.name, () => {
  const TEST_SOURCE_ID = 'TEST' as SourceId;
  let service: TestSourceService;
  let mockSource: Source;
  let subscriptionService: { getSubscribedChannels: jest.Mock };
  let queue: { addBulk: jest.Mock };
  let schedulerRegistry: { addCronJob: jest.Mock };

  beforeEach(() => {
    Source.clearRegistry();
    mockSource = new Source(TEST_SOURCE_ID, {
      label: 'Test',
    });
    subscriptionService = { getSubscribedChannels: jest.fn() };
    queue = { addBulk: jest.fn().mockResolvedValue(undefined) };
    schedulerRegistry = { addCronJob: jest.fn() };

    service = new TestSourceService(
      mockSource,
      {} as MikroORM,
      subscriptionService as unknown as SubscriptionService,
      queue as unknown as Queue<SourceJobData>,
      schedulerRegistry as unknown as SchedulerRegistry,
    );
  });

  describe('onModuleInit', () => {
    it('should register cron jobs and trigger an immediate process', () => {
      const process = jest
        .spyOn(
          service as unknown as { process: () => Promise<void> },
          'process',
        )
        .mockResolvedValue(undefined);

      service.onModuleInit();

      expect(schedulerRegistry.addCronJob).toHaveBeenCalledTimes(
        service['schedules'].length,
      );
      expect(process).toHaveBeenCalledTimes(1);
    });
  });

  describe('process', () => {
    const process = () =>
      (service as unknown as { process: () => Promise<void> }).process();

    it('should log when there are no new articles', async () => {
      service.getUnsavedNews.mockResolvedValue([]);

      await process();

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        Constants.MESSAGES.noNewArticles(),
      );
    });

    it('should save articles and enqueue jobs', async () => {
      const news = [{}];
      const articles = [{ id: 1 } as TestArticle, { id: 2 } as TestArticle];

      service.getUnsavedNews.mockResolvedValue(news);
      service.saveNews.mockResolvedValue(articles);
      subscriptionService.getSubscribedChannels.mockResolvedValue([
        '111',
        '222',
      ]);

      await process();

      expect(service.saveNews).toHaveBeenCalledWith(news);
      expect(subscriptionService.getSubscribedChannels).toHaveBeenCalledWith(
        mockSource,
      );
      expect(queue.addBulk).toHaveBeenCalledWith([
        {
          name: `${mockSource.id}:111`,
          data: { channelId: '111', articleIds: [1, 2] },
        },
        {
          name: `${mockSource.id}:222`,
          data: { channelId: '222', articleIds: [1, 2] },
        },
      ]);
    });

    it('should log error when an exception is thrown', async () => {
      const error = new Error('fetch failed');
      service.getUnsavedNews.mockRejectedValue(error);

      await process();

      expect(Logger.prototype.error).toHaveBeenCalledWith(error);
    });
  });
});
