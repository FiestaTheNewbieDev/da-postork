import { SetMetadata } from '@nestjs/common';

export const DISCORD_COMMAND_METADATA = 'DISCORD_COMMAND_METADATA';

export interface DiscordCommandOptions {
  name: string;
}

export const DiscordCommand = (
  options: DiscordCommandOptions,
): ClassDecorator => SetMetadata(DISCORD_COMMAND_METADATA, options);
