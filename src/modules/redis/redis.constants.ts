import { Messages } from '@/types';
import { SubscriptionSource } from '@entities/subscription.entity';

export const MESSAGES = {
  ready: () => 'Redis Client Connected',
} as const satisfies Messages;

export const CACHE_KEYS = {
  subscribedChannels: (source: SubscriptionSource) =>
    `subscriptions:channels:${source}`,
} as const;

export const CACHE_TTL = {
  subscribedChannels: 60 * 60 * 24,
} as const;
