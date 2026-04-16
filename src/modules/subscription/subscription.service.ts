import {
  Subscription,
  SubscriptionSource,
} from '@entities/subscription.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CACHE_KEYS, CACHE_TTL } from '@modules/redis/redis.constants';
import { RedisService } from '@modules/redis/redis.service';
import * as Constants from '@modules/subscription/subscription.constants';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: EntityRepository<Subscription>,
    private readonly redisService: RedisService,
  ) {}

  public async getSubscribedChannels(
    source: SubscriptionSource,
  ): Promise<string[]> {
    const cacheKey = CACHE_KEYS.subscribedChannels(source);
    const cached = await this.redisService.client.get(cacheKey);

    if (cached) return JSON.parse(cached) as string[];

    const subscriptions = await this.subscriptionRepo.find({ source });
    const channelIds = subscriptions.map((s) => s.channelId);

    void this.redisService.client.setEx(
      cacheKey,
      CACHE_TTL.subscribedChannels,
      JSON.stringify(channelIds),
    );

    return channelIds;
  }

  public async getChannelSubscriptions(
    channelId: string,
  ): Promise<Subscription[]> {
    return this.subscriptionRepo.find({ channelId });
  }

  public async subscribe(
    source: SubscriptionSource,
    channelId: string,
  ): Promise<Subscription> {
    const existing = await this.subscriptionRepo.findOne({ source, channelId });

    if (existing)
      throw new ConflictException(
        Constants.ERROR_MESSAGES.alreadySubscribed(channelId, source),
      );

    const subscription = this.subscriptionRepo.create({ source, channelId });
    const em = this.subscriptionRepo.getEntityManager();
    em.persist(subscription);
    await em.flush();

    await this.addToSubscribedChannelsCache(source, channelId);

    return subscription;
  }

  public async unsubscribe(
    source: SubscriptionSource,
    channelId: string,
  ): Promise<void> {
    const subscription = await this.subscriptionRepo.findOne({
      source,
      channelId,
    });

    if (!subscription)
      throw new NotFoundException(
        Constants.ERROR_MESSAGES.subscriptionNotFound(channelId, source),
      );

    const em = this.subscriptionRepo.getEntityManager();
    em.remove(subscription);
    await em.flush();

    await this.removeFromSubscribedChannelsCache(source, channelId);
  }

  private async addToSubscribedChannelsCache(
    source: SubscriptionSource,
    channelId: string,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.subscribedChannels(source);
    const cached = await this.redisService.client.get(cacheKey);

    if (!cached) return;

    const channelIds = JSON.parse(cached) as string[];
    void this.redisService.client.setEx(
      cacheKey,
      CACHE_TTL.subscribedChannels,
      JSON.stringify([...channelIds, channelId]),
    );
  }

  private async removeFromSubscribedChannelsCache(
    source: SubscriptionSource,
    channelId: string,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.subscribedChannels(source);
    const cached = await this.redisService.client.get(cacheKey);

    if (!cached) return;

    const channelIds = (JSON.parse(cached) as string[]).filter(
      (id) => id !== channelId,
    );
    void this.redisService.client.setEx(
      cacheKey,
      CACHE_TTL.subscribedChannels,
      JSON.stringify(channelIds),
    );
  }
}
