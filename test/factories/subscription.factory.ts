import {
  Subscription,
  SubscriptionSource,
} from '@entities/subscription.entity';

export function subscriptionFactory(
  overrides: Partial<Subscription> = {},
): Subscription {
  return Object.assign(new Subscription(), {
    source: SubscriptionSource.WarhammerCommunity,
    channelId: '111',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  });
}
