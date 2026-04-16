import { z } from 'zod';
import * as Schemas from './codexygo.schemas';

export type Tag = z.infer<typeof Schemas.tagSchema>;
export type Article = z.infer<
  typeof Schemas.initialServerDataSchema
>['articleRecord'][string];
export type Category = z.infer<
  typeof Schemas.initialServerDataSchema
>['categoryRecord'][string];
export type Member = z.infer<
  typeof Schemas.initialServerDataSchema
>['memberRecord'][string];
export type InitialServerData = z.infer<typeof Schemas.initialServerDataSchema>;
