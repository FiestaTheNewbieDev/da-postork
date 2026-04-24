import { Messages } from '@/types';
import { Source } from '@sources/core/source';

export const MESSAGES = {
  ready: () => 'Redis Client Connected',
} as const satisfies Messages;

export const CACHE_KEYS = {
  subscribedChannels: (source: Source) => `subscriptions:channels:${source.id}`,
} as const;

export const CACHE_TTL = {
  subscribedChannels: 60 * 60 * 24,
} as const;
