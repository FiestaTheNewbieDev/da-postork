import { configSchema } from '@modules/config/config.schema';
import z from 'zod';

export type Config = z.infer<typeof configSchema>;
