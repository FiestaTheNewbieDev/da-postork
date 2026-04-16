import { SubscriptionSource } from '@entities/subscription.entity';
import { SOURCE_METADATA } from '@modules/subscription/subscription.constants';

export const fmt = {
  user: (id: string) => `<@${id}>`,
  channel: (id: string) => `<#${id}>`,
  channelOrDM: (id: string, isDM: boolean) => (isDM ? 'this DM' : `<#${id}>`),
  code: (v: string) => `\`${v}\``,
  bold: (v: string) => `**${v}**`,

  // Custom formatting
  source: (source: SubscriptionSource) =>
    `[\`${SOURCE_METADATA[source].label}\`](${SOURCE_METADATA[source].url})`,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => string>;
