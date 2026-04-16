import { CodexYGOMember } from '@entities/codexygo/codexygo-member.entity';

export function codexygoMemberFactory(
  overrides: Partial<CodexYGOMember> = {},
): CodexYGOMember {
  return Object.assign(new CodexYGOMember(), {
    id: 1,
    codexygoOid: 1,
    username: 'member',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });
}
