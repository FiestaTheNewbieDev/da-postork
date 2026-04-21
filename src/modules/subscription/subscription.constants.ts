import { Messages } from '@/types';
import {
  Subscription,
  SubscriptionSource,
} from '@entities/subscription.entity';
import { fmt as discordFmt } from '@modules/discord/discord.utils';
import * as CodexYGOConstants from '@sources/codexygo/codexygo.constants';
import * as GundamOfficialConstants from '@sources/gundam-official/gundam-official.constants';
import * as WarhammerCommunityConstants from '@sources/warhammer-community/warhammer-community.constants';
import { fmt as loggerFmt } from '@utils/logger.utils';

export const SOURCE_METADATA = {
  [SubscriptionSource.WarhammerCommunity]: {
    label: WarhammerCommunityConstants.WARHAMMER_COMMUNITY_LABEL,
    description: 'The essential Warhammer news and features site',
    url: WarhammerCommunityConstants.WARHAMMER_COMMUNITY_WEBSITE_BASE_URL,
    value: SubscriptionSource.WarhammerCommunity,
  },
  [SubscriptionSource.CodexYGO]: {
    label: CodexYGOConstants.CODEXYGO_LABEL,
    description: "Le site n° 1 sur l'information pour Yu-Gi-Oh! en France.",
    url: CodexYGOConstants.CODEXYGO_WEBSITE_BASE_URL,
    value: SubscriptionSource.CodexYGO,
  },
  [SubscriptionSource.GundamOfficial]: {
    label: GundamOfficialConstants.GUNDAM_OFFICIAL_LABEL,
    description:
      'Stay up to date with the latest Gundam news, covering anime, movies, products, and events.',
    url: GundamOfficialConstants.GUNDAM_OFFICIAL_WEBSITE_BASE_URL,
    value: SubscriptionSource.GundamOfficial,
  },
} as const satisfies {
  [K in SubscriptionSource]: {
    label: string;
    description: Nullable<string>;
    url: Nullable<string>;
    value: K;
  };
};

export const REPLIES = {
  subscribeSuccess: (
    channelId: string,
    source: SubscriptionSource,
    isDM: boolean = false,
  ) =>
    isDM
      ? `You are now subscribed to ${discordFmt.source(source)}.`
      : `${discordFmt.channel(channelId)} is now subscribed to ${discordFmt.source(source)}.`,
  subscribeError: (
    channelId: string,
    source: SubscriptionSource,
    isDM: boolean = false,
  ) =>
    isDM
      ? `An error occurred while subscribing to ${discordFmt.source(source)}. Please try again later.`
      : `An error occurred while subscribing ${discordFmt.channel(channelId)} to ${discordFmt.source(source)}. Please try again later.`,

  unsubscribeSuccess: (
    channelId: string,
    source: SubscriptionSource,
    isDM: boolean = false,
  ) =>
    isDM
      ? `You are now unsubscribed from ${discordFmt.source(source)}.`
      : `${discordFmt.channel(channelId)} is now unsubscribed from ${discordFmt.source(source)}.`,
  unsubscribeError: (
    channelId: string,
    source: SubscriptionSource,
    isDM: boolean = false,
  ) =>
    isDM
      ? `An error occurred while unsubscribing from ${discordFmt.source(source)}. Please try again later.`
      : `An error occurred while unsubscribing ${discordFmt.channel(channelId)} from ${discordFmt.source(source)}. Please try again later.`,

  subscriptions: (
    channelId: string,
    subscriptions: Subscription[],
    isDM: boolean = false,
  ) =>
    `${isDM ? 'You are subscribed to the following sources' : `${discordFmt.channel(channelId)} is subscribed to the following sources`}:\n${subscriptions
      .map(
        (subscription: Subscription) =>
          `- ${discordFmt.source(subscription.source)}`,
      )
      .join('\n')}`,
  noSubscriptions: (channelId: string, isDM: boolean = false) =>
    isDM
      ? 'You are not subscribed to any sources.'
      : `${discordFmt.channel(channelId)} is not subscribed to any sources.`,
  subscriptionsError: (channelId: string, isDM: boolean = false) =>
    isDM
      ? 'An error occurred while fetching your subscriptions. Please try again later.'
      : `An error occurred while fetching subscriptions for ${discordFmt.channel(channelId)}. Please try again later.`,

  alreadySubscribed: (
    channelId: string,
    source: SubscriptionSource,
    isDM: boolean = false,
  ) =>
    isDM
      ? `You are already subscribed to ${discordFmt.source(source)}.`
      : `${discordFmt.channel(channelId)} is already subscribed to ${discordFmt.source(source)}.`,
  notSubscribed: (
    channelId: string,
    source: SubscriptionSource,
    isDM: boolean = false,
  ) =>
    isDM
      ? `You are not subscribed to ${discordFmt.source(source)}.`
      : `${discordFmt.channel(channelId)} is not subscribed to ${discordFmt.source(source)}.`,
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
