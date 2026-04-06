import {
  Subscription,
  SubscriptionSource,
} from '@entities/subscription.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe(SubscriptionService.name, () => {
  let service: SubscriptionService;
  let fork: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    persist: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    fork = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      persist: jest.fn().mockReturnValue({ flush: jest.fn() }),
      remove: jest.fn().mockReturnValue({ flush: jest.fn() }),
    };

    const em = {
      fork: jest.fn().mockReturnValue(fork),
    } as unknown as EntityManager;
    service = new SubscriptionService(em);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSubscribedChannels', () => {
    it('should return the channel ids for the given source', async () => {
      const source = SubscriptionSource.WarhammerCommunity;
      fork.find.mockResolvedValue([{ channelId: '111' }, { channelId: '222' }]);

      const result = await service.getSubscribedChannels(source);

      expect(fork.find).toHaveBeenCalledWith(Subscription, { source });
      expect(result).toEqual(['111', '222']);
    });

    it('should return an empty array when there are no subscriptions', async () => {
      fork.find.mockResolvedValue([]);

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
      fork.find.mockResolvedValue(subscriptions);

      const result = await service.getChannelSubscriptions(channelId);

      expect(fork.find).toHaveBeenCalledWith(Subscription, { channelId });
      expect(result).toBe(subscriptions);
    });

    it('should return an empty array when there are no subscriptions', async () => {
      fork.find.mockResolvedValue([]);

      const result = await service.getChannelSubscriptions('unknown');

      expect(result).toEqual([]);
    });
  });

  describe('subscribe', () => {
    const source = SubscriptionSource.WarhammerCommunity;
    const channelId = '111';

    it('should create and return a new subscription', async () => {
      const subscription = { source, channelId } as Subscription;
      fork.findOne.mockResolvedValue(null);
      fork.create.mockReturnValue(subscription);

      const result = await service.subscribe(source, channelId);

      expect(fork.findOne).toHaveBeenCalledWith(Subscription, {
        source,
        channelId,
      });
      expect(fork.create).toHaveBeenCalledWith(Subscription, {
        source,
        channelId,
      });
      expect(fork.persist).toHaveBeenCalledWith(subscription);
      expect(result).toBe(subscription);
    });

    it('should throw ConflictException when already subscribed', async () => {
      fork.findOne.mockResolvedValue({ source, channelId });

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
      fork.findOne.mockResolvedValue(subscription);

      await service.unsubscribe(source, channelId);

      expect(fork.findOne).toHaveBeenCalledWith(Subscription, {
        source,
        channelId,
      });
      expect(fork.remove).toHaveBeenCalledWith(subscription);
    });

    it('should throw NotFoundException when not subscribed', async () => {
      fork.findOne.mockResolvedValue(null);

      await expect(service.unsubscribe(source, channelId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
