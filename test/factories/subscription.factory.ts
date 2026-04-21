import { SourceId, Subscription } from '@entities/subscription.entity';

export function subscriptionFactory(
  overrides: Partial<Subscription> = {},
): Subscription {
  return Object.assign(new Subscription(), {
    source: SourceId.WarhammerCommunity,
    channelId: '111',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  });
}
