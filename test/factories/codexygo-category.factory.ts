import { CodexYGOCategory } from '@entities/codexygo/codexygo-category.entity';

export function codexyGoCategoryFactory(
  overrides: Partial<CodexYGOCategory> = {},
): CodexYGOCategory {
  return Object.assign(new CodexYGOCategory(), {
    id: 1,
    codexygoOid: 1,
    name: 'Category',
    path: '/category',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });
}
