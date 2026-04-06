import {
  Subscription,
  SubscriptionSource,
} from '@entities/subscription.entity';
import { EntityManager } from '@mikro-orm/postgresql';
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

  constructor(private readonly em: EntityManager) {}

  public async getSubscribedChannels(
    source: SubscriptionSource,
  ): Promise<string[]> {
    const subscriptions = await this.em.fork().find(Subscription, { source });
    return subscriptions.map((s) => s.channelId);
  }

  public async getChannelSubscriptions(
    channelId: string,
  ): Promise<Subscription[]> {
    const subscriptions = await this.em
      .fork()
      .find(Subscription, { channelId });

    return subscriptions;
  }

  public async subscribe(
    source: SubscriptionSource,
    channelId: string,
  ): Promise<Subscription> {
    const fork = this.em.fork();
    let subscription = await fork.findOne(Subscription, { source, channelId });

    if (subscription)
      throw new ConflictException(
        Constants.ERROR_MESSAGES.alreadySubscribed(channelId, source),
      );

    subscription = fork.create(Subscription, {
      source,
      channelId,
    });

    await fork.persist(subscription).flush();

    return subscription;
  }

  public async unsubscribe(
    source: SubscriptionSource,
    channelId: string,
  ): Promise<void> {
    const subscription = await this.em
      .fork()
      .findOne(Subscription, { source, channelId });

    if (!subscription)
      throw new NotFoundException(
        Constants.ERROR_MESSAGES.subscriptionNotFound(channelId, source),
      );

    await this.em.fork().remove(subscription).flush();
  }
}
