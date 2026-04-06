import { Messages } from '@/types';
import {
  Subscription,
  SubscriptionSource,
} from '@entities/subscription.entity';
import { fmt as discordFmt } from '@modules/discord/discord.utils';
import { fmt as loggerFmt } from '@utils/logger-fmt';

export const SOURCES_MAP = {
  [SubscriptionSource.WarhammerCommunity]: {
    label: 'Warhammer Community',
    description: 'The essential Warhammer news and features site',
    url: 'https://www.warhammer-community.com/',
    value: SubscriptionSource.WarhammerCommunity,
  },
  [SubscriptionSource.CodexYGO]: {
    label: 'Codex YGO',
    description: null,
    url: 'https://codexygo.fr/',
    value: SubscriptionSource.CodexYGO,
  },
} satisfies {
  [K in SubscriptionSource]: {
    label: string;
    description: Nullable<string>;
    url: Nullable<string>;
    value: K;
  };
};

export const REPLIES = {
  subscribeSuccess: (channelId: string, source: SubscriptionSource) =>
    `${discordFmt.channel(channelId)} is now subscribed to ${discordFmt.source(source)}.`,
  subscribeError: (channelId: string, source: SubscriptionSource) =>
    `An error occurred while subscribing ${discordFmt.channel(channelId)} to ${discordFmt.source(source)}. Please try again later.`,

  unsubscribeSuccess: (channelId: string, source: SubscriptionSource) =>
    `${discordFmt.channel(channelId)} is now unsubscribed from ${discordFmt.source(source)}.`,
  unsubscribeError: (channelId: string, source: SubscriptionSource) =>
    `An error occurred while unsubscribing ${discordFmt.channel(channelId)} from ${discordFmt.source(source)}. Please try again later.`,

  subscriptions: (channelId: string, subscriptions: Subscription[]) =>
    `${discordFmt.channel(channelId)} is subscribed to the following sources:\n${subscriptions
      .map(
        (subscription: Subscription) =>
          `- ${discordFmt.source(subscription.source)}`,
      )
      .join('\n')}`,
  noSubscriptions: (channelId: string) =>
    `${discordFmt.channel(channelId)} is not subscribed to any sources.`,
  subscriptionsError: (channelId: string) =>
    `An error occurred while fetching subscriptions for ${discordFmt.channel(channelId)}. Please try again later.`,

  alreadySubscribed: (channelId: string, source: SubscriptionSource) =>
    `${discordFmt.channel(channelId)} is already subscribed to ${discordFmt.source(source)}.`,
  notSubscribed: (channelId: string, source: SubscriptionSource) =>
    `${discordFmt.channel(channelId)} is not subscribed to ${discordFmt.source(source)}.`,
} as const satisfies Messages;

export const ERROR_MESSAGES = {
  subscribeError: (channelId: string, source: SubscriptionSource) =>
    `Error subscribing channel ${loggerFmt.bold(channelId)} to source ${loggerFmt.bold(source)}`,
  unsubscribeError: (channelId: string, source: SubscriptionSource) =>
    `Error unsubscribing channel ${loggerFmt.bold(channelId)} from source ${loggerFmt.bold(source)}`,
  subscriptionsError: (channelId: string) =>
    `Error fetching subscriptions for channel ${loggerFmt.bold(channelId)}`,

  alreadySubscribed: (channelId: string, source: SubscriptionSource) =>
    `Channel ${loggerFmt.bold(channelId)} is already subscribed to source ${loggerFmt.bold(source)}`,
  subscriptionNotFound: (channelId: string, source: SubscriptionSource) =>
    `Subscription for channel ${loggerFmt.bold(channelId)} and source ${loggerFmt.bold(source)} not found`,
} as const satisfies Messages;
