import { SubscriptionSource } from '@entities/subscription.entity';
import { SOURCES_MAP } from '@modules/subscription/subscription.constants';

export const fmt = {
  user: (id: string) => `<@${id}>`,
  channel: (id: string) => `<#${id}>`,
  code: (v: string) => `\`${v}\``,
  bold: (v: string) => `**${v}**`,

  // Custom formatting
  source: (source: SubscriptionSource) => `\`${SOURCES_MAP[source].label}\``,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (v: any) => string>;
