export const MESSAGES = {
  ready: (username: string) => `${username} ready`,
  'event-loaded': (eventName: string) => `Event loaded: ${eventName}`,
  'command-loaded': (commandName: string) => `Command loaded: ${commandName}`,
} as const;

export const ERROR_MESSAGES = {
  'no-discord-bot-token': 'No discord bot token provided',
  'unknown-event': (eventName: string) => `Unknown event: ${eventName}`,
  'unsupported-channel-type': 'Unsupported channel type',
  'register-commands-failed': (devGuildId: string) =>
    `Failed to register commands in guild ${devGuildId}`,
  'get-event-instance-failed': (constructorName: string) =>
    `Failed to get event instance of ${constructorName}`,
  'get-command-instance-failed': (constructorName: string) =>
    `Failed to get command instance of ${constructorName}`,
} as const;

export const WARN_MESSAGES = {
  'no-dev-guild-id': 'No dev guild id provided',
} as const;
