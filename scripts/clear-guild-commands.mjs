#!/usr/bin/env node
import { REST, Routes } from 'discord.js';

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.argv[2];

if (!token) {
  console.error('Missing DISCORD_BOT_TOKEN in environment');
  process.exit(1);
}

if (!guildId) {
  console.error('Usage: node scripts/clear-guild-commands.mjs <guildId>');
  process.exit(1);
}

const rest = new REST().setToken(token);

const app = await rest.get(Routes.oauth2CurrentApplication());
const clientId = app.id;

console.log(`Clearing commands for guild ${guildId}...`);
await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
console.log('Done.');
