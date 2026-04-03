import { SetMetadata } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

export const DISCORD_EVENT_METADATA = 'DISCORD_EVENT_METADATA';

export interface DiscordEventOptions {
  name: keyof ClientEvents;
  once?: boolean;
}

export const DiscordEvent = (options: DiscordEventOptions): ClassDecorator =>
  SetMetadata(DISCORD_EVENT_METADATA, { once: false, ...options });
