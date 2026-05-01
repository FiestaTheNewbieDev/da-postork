import { z } from 'zod';
import * as Schemas from './github-blog.schemas';

export type Article = z.infer<typeof Schemas.articleSchema> & {
  categoryTitle: string;
  authors: string[];
};
