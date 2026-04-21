import { AbstractArticle } from '@entities/abstract-article.entity';
import { SourceId } from '@entities/subscription.entity';
import { MikroORM } from '@mikro-orm/core';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { Logger } from '@nestjs/common';
import { Source } from '@sources/core/abstract-source';
import { AbstractSourceService } from '@sources/core/abstract-source-service';
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
  getUnsavedNews = jest.fn<Promise<unknown[]>, []>();
  saveNews = jest.fn<Promise<TestArticle[]>, [unknown[]]>();
  getArticlesByIds = jest.fn<Promise<TestArticle[]>, [number[]]>();
  buildEmbed = jest.fn<EmbedBuilder, [TestArticle]>();
}

describe(AbstractSourceService.name, () => {
  let service: TestSourceService;
  let mockSource: Source;
  let subscriptionService: { getSubscribedChannels: jest.Mock };
  let queue: { addBulk: jest.Mock };

  beforeEach(() => {
    mockSource = {
      id: 'TEST' as SourceId,
      label: 'Test',
      description: null,
      url: null,
    } as Source;
    subscriptionService = { getSubscribedChannels: jest.fn() };
    queue = { addBulk: jest.fn().mockResolvedValue(undefined) };

    service = new TestSourceService(
      mockSource,
      {} as MikroORM,
      subscriptionService as unknown as SubscriptionService,
      queue as unknown as Queue<SourceJobData>,
    );
  });

  describe('onModuleInit', () => {
    it('should call handleCron', () => {
      jest
        .spyOn(
          service as unknown as { handleCron: () => Promise<void> },
          'handleCron',
        )
        .mockResolvedValue(undefined);

      service.onModuleInit();

      expect(
        (service as unknown as { handleCron: jest.Mock }).handleCron,
      ).toHaveBeenCalled();
    });
  });

  describe('handleCron', () => {
    const handleCron = () =>
      (service as unknown as { handleCron: () => Promise<void> }).handleCron();

    it('should log when there are no new articles', async () => {
      service.getUnsavedNews.mockResolvedValue([]);

      await handleCron();

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

      await handleCron();

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

      await handleCron();

      expect(Logger.prototype.error).toHaveBeenCalledWith(error);
    });
  });
});
