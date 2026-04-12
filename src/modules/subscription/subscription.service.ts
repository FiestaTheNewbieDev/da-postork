import {
  Subscription,
  SubscriptionSource,
} from '@entities/subscription.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
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
  ) {}

  public async getSubscribedChannels(
    source: SubscriptionSource,
  ): Promise<string[]> {
    const subscriptions = await this.subscriptionRepo.find({ source });
    return subscriptions.map((s) => s.channelId);
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
  }
}
