import { Messages } from '@/types';
import { fmt } from '@utils/logger-fmt';
import { PermissionsBitField } from 'discord.js';

export const REPLIES = {
  missingPermissions: (permissions?: Nullish<string | string[]>) => {
    const perms = Array.isArray(permissions)
      ? `${permissions.map((p) => fmt.bold(p)).join(', ')} permissions`
      : fmt.bold(permissions ?? 'required permissions');
    return `You need the ${perms} to use this command.`;
  },
} as const satisfies Messages;

export const MESSAGES = {
  ready: (username: string) => `Ready as ${fmt.bold(username)}`,
} as const satisfies Messages;

export const ERROR_MESSAGES = {
  noDiscordBotToken: () => 'No discord bot token provided',
} as const satisfies Messages;

export const SEND_EMBED = [
  PermissionsBitField.Flags.ViewChannel,
  PermissionsBitField.Flags.SendMessages,
  PermissionsBitField.Flags.EmbedLinks,
];

export const ADD_REACTIONS = [
  PermissionsBitField.Flags.ViewChannel,
  PermissionsBitField.Flags.ReadMessageHistory,
  PermissionsBitField.Flags.AddReactions,
];
