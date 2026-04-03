import { fmt } from '@utils/logger-fmt';

export const MESSAGES = {
  ready: (username: string) => `Ready as ${fmt.bold(username)}`,
} as const;

export const ERROR_MESSAGES = {
  noDiscordBotToken: () => 'No discord bot token provided',
} as const;
