import { Messages } from '@/types';
import { fmt } from '@utils/logger.utils';
import { PermissionsBitField } from 'discord.js';

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
