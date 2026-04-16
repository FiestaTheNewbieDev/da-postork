import { WarhammerCommunityArticle } from '@entities/warhammer-community-article.entity';

export function warhammerCommunityArticleFactory(
  overrides: Partial<WarhammerCommunityArticle> = {},
): WarhammerCommunityArticle {
  return Object.assign(new WarhammerCommunityArticle(), {
    id: 1,
    warhammerCommunityId: 'wc-id-1',
    warhammerCommunityUuid: 'wc-uuid-1',
    warhammerCommunitySlug: 'wc-slug-1',
    title: 'Warhammer Community Article',
    locale: 'en',
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });
}
