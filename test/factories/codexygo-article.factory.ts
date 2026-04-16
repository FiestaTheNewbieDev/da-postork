import { CodexYGOArticle } from '@entities/codexygo/codexygo-article.entity';
import { CodexYGOMember } from '@entities/codexygo/codexygo-member.entity';
import { codexygoMemberFactory } from '@factories/codexygo-member.factory';
import { Collection } from '@mikro-orm/core';

export function codexygoArticleFactory(
  overrides: Partial<CodexYGOArticle> = {},
): CodexYGOArticle {
  const article = new CodexYGOArticle();
  return Object.assign(article, {
    id: 1,
    codexygoOid: 1,
    codexygoSlug: 'article-slug',
    title: 'CodexYGO Article',
    tags: [],
    categories: new Collection<CodexYGOArticle>(article),
    creator: codexygoMemberFactory() as unknown as CodexYGOMember,
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });
}
