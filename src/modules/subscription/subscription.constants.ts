import { Messages } from '@/types';
import { fmt as discordFmt } from '@modules/discord/discord.utils';
import { Source } from '@sources/core/abstract-source';
import { fmt as loggerFmt } from '@utils/logger.utils';

export const REPLIES = {
  subscribeSuccess: (
    channelId: string,
    source: Source,
    isDM: boolean = false,
  ) =>
    isDM
      ? `You are now subscribed to ${source.toDiscordString()}.`
      : `${discordFmt.channel(channelId)} is now subscribed to ${source.toDiscordString()}.`,
  subscribeError: (channelId: string, source: Source, isDM: boolean = false) =>
    isDM
      ? `An error occurred while subscribing to ${source.toDiscordString()}. Please try again later.`
      : `An error occurred while subscribing ${discordFmt.channel(channelId)} to ${source.toDiscordString()}. Please try again later.`,

  unsubscribeSuccess: (
    channelId: string,
    source: Source,
    isDM: boolean = false,
  ) =>
    isDM
      ? `You are now unsubscribed from ${source.toDiscordString()}.`
      : `${discordFmt.channel(channelId)} is now unsubscribed from ${source.toDiscordString()}.`,
  unsubscribeError: (
    channelId: string,
    source: Source,
    isDM: boolean = false,
  ) =>
    isDM
      ? `An error occurred while unsubscribing from ${source.toDiscordString()}. Please try again later.`
      : `An error occurred while unsubscribing ${discordFmt.channel(channelId)} from ${source.toDiscordString()}. Please try again later.`,

  subscriptions: (
    channelId: string,
    subscribedSources: Source[],
    isDM: boolean = false,
  ) =>
    `${isDM ? 'You are subscribed to the following sources' : `${discordFmt.channel(channelId)} is subscribed to the following sources`}:\n${subscribedSources
      .map((source: Source) => `- ${source.toDiscordString()}`)
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
    source: Source,
    isDM: boolean = false,
  ) =>
    isDM
      ? `You are already subscribed to ${source.toDiscordString()}.`
      : `${discordFmt.channel(channelId)} is already subscribed to ${source.toDiscordString()}.`,
  notSubscribed: (channelId: string, source: Source, isDM: boolean = false) =>
    isDM
      ? `You are not subscribed to ${source.toDiscordString()}.`
      : `${discordFmt.channel(channelId)} is not subscribed to ${source.toDiscordString()}.`,
} as const satisfies Messages;

export const ERROR_MESSAGES = {
  subscribeError: (channelId: string, source: Source) =>
    `Error subscribing channel ${loggerFmt.bold(channelId)} to source ${loggerFmt.bold(source)}`,
  unsubscribeError: (channelId: string, source: Source) =>
    `Error unsubscribing channel ${loggerFmt.bold(channelId)} from source ${loggerFmt.bold(source)}`,
  subscriptionsError: (channelId: string) =>
    `Error fetching subscriptions for channel ${loggerFmt.bold(channelId)}`,

  alreadySubscribed: (channelId: string, source: Source) =>
    `Channel ${loggerFmt.bold(channelId)} is already subscribed to source ${loggerFmt.bold(source)}`,
  subscriptionNotFound: (channelId: string, source: Source) =>
    `Subscription for channel ${loggerFmt.bold(channelId)} and source ${loggerFmt.bold(source)} not found`,
} as const satisfies Messages;
