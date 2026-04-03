import { fmt } from '@utils/logger-fmt';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, (...args: any[]) => string>;

export const MESSAGES = {
  ready: (username: string) => `Ready as ${fmt.bold(username)}`,
  eventRegistered: (eventName: string) =>
    `Event registered: ${fmt.bold(eventName)}`,
  commandRegistered: (commandName: string) =>
    `Command registered: ${fmt.bold(commandName)}`,
  commandsDeployed: (target: string) =>
    `Slash commands deployed to ${fmt.bold(target)}`,
} as const satisfies Messages;

export const WARN_MESSAGES = {
  noDevGuildId: () => 'No dev guild id provided',
  unknownEventRegistered: (eventName: string) =>
    `Unknown event registered: ${fmt.bold(eventName)}`,
} as const satisfies Messages;

export const ERROR_MESSAGES = {
  noDiscordBotToken: () => 'No discord bot token provided',
} as const satisfies Messages;
