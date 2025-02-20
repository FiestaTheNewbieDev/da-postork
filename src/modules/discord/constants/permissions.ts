import { PermissionsBitField } from 'discord.js';

export const SEND_EMBED = [
  PermissionsBitField.Flags.ViewChannel,
  PermissionsBitField.Flags.SendMessages,
  PermissionsBitField.Flags.EmbedLinks,
];

export const SEND_REACTION = [
  PermissionsBitField.Flags.ViewChannel,
  PermissionsBitField.Flags.ReadMessageHistory,
  PermissionsBitField.Flags.AddReactions,
];
