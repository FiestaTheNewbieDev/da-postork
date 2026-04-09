import { ERROR_MESSAGES as DISCORD_ERROR_MESSAGES } from '@modules/discord/discord.constants';
import { name, version } from 'package.json';
import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  DISCORD_BOT_TOKEN: z
    .string()
    .nonempty({ message: DISCORD_ERROR_MESSAGES.noDiscordBotToken() }),
  DEV_GUILD_ID: z.string().optional(),

  POSTGRES_HOST: z.string().nonempty(),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().nonempty(),
  POSTGRES_PASSWORD: z.string().nonempty(),
  POSTGRES_DB: z.string().nonempty(),

  REDIS_HOST: z.string().nonempty(),
  REDIS_PORT: z.coerce.number().default(6379),

  USER_AGENT: z.string().default(`${name}/${version} (scraper bot)`),
});
