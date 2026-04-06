import { Messages } from '@/types';

export const MESSAGES = {
  ready: () => 'Redis Client Connected',
} as const satisfies Messages;
