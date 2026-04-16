import {
  Subscription,
  SubscriptionSource,
} from '@entities/subscription.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { RedisService } from '@modules/redis/redis.service';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe(SubscriptionService.name, () => {
  let service: SubscriptionService;
  let subscriptionRepo: jest.Mocked<EntityRepository<Subscription>>;
  let redisService: jest.Mocked<Pick<RedisService, 'client'>>;
  let em: { persist: jest.Mock; remove: jest.Mock; flush: jest.Mock };

  beforeEach(() => {
    em = {
      persist: jest.fn().mockReturnThis(),
      remove: jest.fn().mockReturnThis(),
      flush: jest.fn().mockResolvedValue(undefined),
    };

    subscriptionRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      getEntityManager: jest.fn().mockReturnValue(em),
    } as unknown as jest.Mocked<EntityRepository<Subscription>>;

    redisService = {
      client: {
        get: jest.fn().mockResolvedValue(null),
        setEx: jest.fn().mockResolvedValue('OK'),
      } as unknown as jest.Mocked<RedisService['client']>,
    };

    service = new SubscriptionService(
      subscriptionRepo,
      redisService as unknown as RedisService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSubscribedChannels', () => {
    it('should return the channel ids for the given source', async () => {
      const source = SubscriptionSource.WarhammerCommunity;
      subscriptionRepo.find.mockResolvedValue([
        { channelId: '111' } as Subscription,
        { channelId: '222' } as Subscription,
      ]);

      const result = await service.getSubscribedChannels(source);

      expect(subscriptionRepo.find).toHaveBeenCalledWith({ source });
      expect(result).toEqual(['111', '222']);
    });

    it('should return an empty array when there are no subscriptions', async () => {
      subscriptionRepo.find.mockResolvedValue([]);

      const result = await service.getSubscribedChannels(
        SubscriptionSource.CodexYGO,
      );

      expect(result).toEqual([]);
    });
  });

  describe('getChannelSubscriptions', () => {
    it('should return the subscriptions for the given channel', async () => {
      const channelId = '111';
      const subscriptions = [
        { source: SubscriptionSource.WarhammerCommunity, channelId },
      ] as Subscription[];
      subscriptionRepo.find.mockResolvedValue(subscriptions);

      const result = await service.getChannelSubscriptions(channelId);

      expect(subscriptionRepo.find).toHaveBeenCalledWith({ channelId });
      expect(result).toBe(subscriptions);
    });

    it('should return an empty array when there are no subscriptions', async () => {
      subscriptionRepo.find.mockResolvedValue([]);

      const result = await service.getChannelSubscriptions('unknown');

      expect(result).toEqual([]);
    });
  });

  describe('subscribe', () => {
    const source = SubscriptionSource.WarhammerCommunity;
    const channelId = '111';

    it('should create and return a new subscription', async () => {
      const subscription = { source, channelId } as Subscription;
      subscriptionRepo.findOne.mockResolvedValue(null);
      subscriptionRepo.create.mockReturnValue(subscription);

      const result = await service.subscribe(source, channelId);

      expect(subscriptionRepo.findOne).toHaveBeenCalledWith({
        source,
        channelId,
      });
      expect(subscriptionRepo.create).toHaveBeenCalledWith({
        source,
        channelId,
      });
      expect(em.persist).toHaveBeenCalledWith(subscription);
      expect(em.flush).toHaveBeenCalled();
      expect(result).toBe(subscription);
    });

    it('should throw ConflictException when already subscribed', async () => {
      subscriptionRepo.findOne.mockResolvedValue({
        source,
        channelId,
      } as Subscription);

      await expect(service.subscribe(source, channelId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('unsubscribe', () => {
    const source = SubscriptionSource.WarhammerCommunity;
    const channelId = '111';

    it('should remove the subscription', async () => {
      const subscription = { source, channelId } as Subscription;
      subscriptionRepo.findOne.mockResolvedValue(subscription);

      await service.unsubscribe(source, channelId);

      expect(subscriptionRepo.findOne).toHaveBeenCalledWith({
        source,
        channelId,
      });
      expect(em.remove).toHaveBeenCalledWith(subscription);
      expect(em.flush).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not subscribed', async () => {
      subscriptionRepo.findOne.mockResolvedValue(null);

      await expect(service.unsubscribe(source, channelId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
