import { z } from 'zod';

export const articleSchema = z.object({
  content_type: z.string(),
  headline: z.string(),
  image: z.object({
    filename: z.string(),
    alt: z.string(),
    height: z.number(),
    width: z.number(),
  }),
  category: z.object({
    title: z.string(),
    link: z.string().nullable(),
  }),
  description: z.string(),
  sponsor: z.boolean(),
  link: z.object({ link: z.string(), title: z.string() }),
  timestamp: z.number(),
  insider_activities: z.array(z.unknown()),
  card_type: z.string(),
  context: z.string(),
});

export const contentGridCardsSchema = z.object({
  code: z.number(),
  status: z.string(),
  etag: z.string(),
  age: z.number(),
  cache: z.string(),
  data: z.object({
    offset: z.number(),
    limit: z.number(),
    total: z.number(),
    count: z.number(),
    results: z.object({
      total: z.number(),
      data: z.array(articleSchema),
    }),
  }),
});
