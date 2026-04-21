import { z } from 'zod';

export const newsSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  displayDatetime: z.coerce.date(),
  thumbnail: z.object({
    url: z.url(),
    alternativeText: z.string().nullable(),
  }),
  publishSite: z.object({
    url: z.url(),
  }),
  linkedSites: z.array(z.unknown()),
  seriesTags: z.array(z.object({ name: z.string() })),
  tags: z.array(z.unknown()),
  categories: z.array(z.object({ name: z.string() })),
  slug: z.string().nullable(),
  isLegacy: z.boolean(),
  href: z.url(),
});

export const newsPageDataSchema = z.object({
  featuredResponse: z.array(
    z.object({ key: z.string(), documentId: z.string() }),
  ),
  rankingResponse: z.array(z.unknown()),
  newsResponse: z.object({
    data: z.array(newsSchema),
    pageCount: z.number(),
  }),
  currentPage: z.number(),
});
