import * as Schemas from '@sources/gundam-official/gundam-official.schemas';
import { z } from 'zod';

export type NewsPageData = z.infer<typeof Schemas.newsPageDataSchema>;
export type News = z.infer<typeof Schemas.newsSchema>;
