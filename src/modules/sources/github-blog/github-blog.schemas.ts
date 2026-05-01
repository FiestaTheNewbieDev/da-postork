import { z } from 'zod';

export const articleSchema = z.object({
  link: z.string(),
  title: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  publishedAt: z.string(),
  authors: z.array(z.string()),
  categoryTitle: z.string(),
});
