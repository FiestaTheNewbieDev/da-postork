export type Tag =
  | 'Booster'
  | 'OCG'
  | 'TCG'
  | 'Yu-Gi-Oh! Duel Monsters'
  | 'Yu-Gi-Oh! GX'
  | "Yu-Gi-Oh! 5D's"
  | 'Yu-Gi-Oh! ZEXAL'
  | 'Yu-Gi-Oh! ARC-V'
  | 'Yu-Gi-Oh! VRAINS'
  | 'Yu-Gi-Oh! CARD GAME THE CHRONICLES'
  | 'BPRO'
  | 'Burst Protocol'
  | 'Exosœur'
  | 'Mercefourrure'
  | "Protocole d'Explosion"
  | (string & {});

export type Article = {
  oid: number;
  slug: string;
  tags: Tag[];
  cards: number[];
  title: string;
  teaser: string;
  changed: Date;
  created: Date;
  creator: number;
  thumbnail: number;
  categories: number[];
  cardRulings: unknown[];
  publishDate: Date;
  userChanged: Date;
  thumbnailEffects: unknown[];
  applicationInstance: number;
};

export type Category = {
  name: string;
  path: string;
  pinned: boolean;
  weight: number;
  changed: Date;
  created: Date;
  creator: number;
  userChanged: Date;
  applicationInstance: number;
  oid: number;
};

export type Member = {
  oid: number;
  userName: string;
  picture: number;
  pictureEffects: unknown[];
  applicationInstance: number;
  roles: string[];
};

export type InitialServerData = {
  recentArticleCount: number;
  recentArticleIds: number[];
  pinnedCategoryIds: number[];
  pinnedCategoryArticleIdsRecord: Record<string, number[]>;
  articleRecord: Record<string, Article>;
  categoryRecord: Record<string, Category>;
  memberRecord: Record<string, Member>;
};
