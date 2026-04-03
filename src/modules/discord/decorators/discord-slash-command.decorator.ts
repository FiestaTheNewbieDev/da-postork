import { SetMetadata } from '@nestjs/common';
import { ApplicationCommandOptionData } from 'discord.js';

export const DISCORD_SLASH_COMMAND_METADATA = 'DISCORD_SLASH_COMMAND_METADATA';

export interface DiscordSlashCommandOptions {
  name: string;
  description: string;
  options?: ApplicationCommandOptionData[];
}

export const DiscordSlashCommand = (
  options: DiscordSlashCommandOptions,
): ClassDecorator => SetMetadata(DISCORD_SLASH_COMMAND_METADATA, options);
