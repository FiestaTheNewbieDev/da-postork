export const fmt = {
  user: (id: string) => `<@${id}>`,
  channel: (id: string) => `<#${id}>`,
  channelOrDM: (id: string, isDM: boolean) => (isDM ? 'this DM' : `<#${id}>`),
  code: (v: string) => `\`${v}\``,
  bold: (v: string) => `**${v}**`,
  link: (label: string, url: string) => `[${label}](${url})`,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => string>;
