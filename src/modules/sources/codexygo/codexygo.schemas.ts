import { z } from 'zod';

export const tagSchema = z.union([
  z.literal('Booster'),
  z.literal('OCG'),
  z.literal('TCG'),
  z.literal('Yu-Gi-Oh! Duel Monsters'),
  z.literal('Yu-Gi-Oh! GX'),
  z.literal("Yu-Gi-Oh! 5D's"),
  z.literal('Yu-Gi-Oh! ZEXAL'),
  z.literal('Yu-Gi-Oh! ARC-V'),
  z.literal('Yu-Gi-Oh! VRAINS'),
  z.literal('Yu-Gi-Oh! CARD GAME THE CHRONICLES'),
  z.literal('BPRO'),
  z.literal('Burst Protocol'),
  z.literal('Exosœur'),
  z.literal('Mercefourrure'),
  z.literal("Protocole d'Explosion"),
  z.string(),
]);

const articleSchema = z.object({
  oid: z.number(),
  slug: z.string(),
  tags: z.array(tagSchema),
  cards: z.array(z.number()),
  title: z.string(),
  teaser: z.string(),
  changed: z.coerce.date(),
  created: z.coerce.date(),
  creator: z.number(),
  thumbnail: z.number(),
  categories: z.array(z.number()),
  cardRulings: z.array(z.unknown()),
  publishDate: z.coerce.date(),
  userChanged: z.coerce.date(),
  thumbnailEffects: z.array(z.unknown()),
  applicationInstance: z.number(),
});

const categorySchema = z.object({
  name: z.string(),
  path: z.string(),
  pinned: z.boolean(),
  weight: z.number(),
  changed: z.coerce.date(),
  created: z.coerce.date(),
  creator: z.number(),
  userChanged: z.coerce.date(),
  applicationInstance: z.number(),
  oid: z.number(),
});

const memberSchema = z.object({
  oid: z.number(),
  userName: z.string(),
  picture: z.number(),
  pictureEffects: z.array(z.unknown()),
  applicationInstance: z.number(),
  roles: z.array(z.string()),
});

export const initialServerDataSchema = z.object({
  recentArticleCount: z.number(),
  recentArticleIds: z.array(z.number()),
  pinnedCategoryIds: z.array(z.number()),
  pinnedCategoryArticleIdsRecord: z.record(z.string(), z.array(z.number())),
  articleRecord: z.record(z.string(), articleSchema),
  categoryRecord: z.record(z.string(), categorySchema),
  memberRecord: z.record(z.string(), memberSchema),
});
