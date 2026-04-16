import { z } from 'zod';

export const localeSchema = z.union([
  z.literal('en-gb'),
  z.literal('de-de'),
  z.string(),
]);

export const collectionSchema = z.union([z.literal('articles'), z.string()]);

export const gameSystemTitleSchema = z.union([
  z.literal('Warhammer 40,000'),
  z.literal('Warhammer: The Horus Heresy'),
  z.literal('Warhammer Plus'),
  z.literal('Warhammer Age of Sigmar'),
  z.literal('Black Library'),
  z.literal('White Dwarf'),
  z.string(),
]);

export const imageSchema = z.object({
  path: z.string().nullable(),
  alt: z.string().nullable(),
  width: z.coerce.number(),
  height: z.coerce.number(),
  focus: z.string(),
});

export const gameSystemSchema = z.object({
  title: gameSystemTitleSchema.optional(),
  light: imageSchema,
  dark: imageSchema,
});

export const topicSchema = z.object({
  title: z.string(),
  slug: z.string(),
});

const newsSchema = z.object({
  title: z.string(),
  site: localeSchema,
  slug: z.string(),
  excerpt: z.string(),
  image: imageSchema,
  collection: collectionSchema,
  game_system: gameSystemSchema,
  topics: z.array(topicSchema),
  date: z.string(),
  hide_date: z.boolean(),
  hide_read_time: z.boolean(),
  interaction_time: z.string(),
  uri: z.string(),
  id: z.string(),
  uuid: z.string(),
});

export const getNewsResponseSchema = z.object({
  news: z.array(newsSchema),
});
