import { AbstractArticle } from '@entities/abstract-article';
import { Entity, Filter, Property, Unique } from '@mikro-orm/core';

@Entity({
  tableName: 'warhammer_community_article',
})
@Unique({
  name: 'warhammer_community_id_uuid_unique',
  properties: ['warhammerCommunityId', 'warhammerCommunityUuid'],
})
@Filter({
  name: 'notDeleted',
  cond: { deletedAt: null },
  default: true,
})
export class WarhammerCommunityArticle extends AbstractArticle {
  @Property({
    name: 'warhammer_community_id',
    columnType: 'varchar(64)',
    nullable: false,
  })
  readonly warhammerCommunityId!: string;

  @Property({
    name: 'warhammer_community_uuid',
    columnType: 'varchar(64)',
    nullable: false,
  })
  readonly warhammerCommunityUuid!: string;

  @Property({
    name: 'warhammer_community_slug',
    columnType: 'varchar(255)',
    nullable: false,
  })
  readonly warhammerCommunitySlug!: string;

  @Property({ name: 'title', columnType: 'varchar(255)', nullable: false })
  title!: string;

  @Property({ name: 'excerpt', columnType: 'varchar(512)', nullable: true })
  excerpt?: string;

  @Property({
    name: 'locale',
    columnType: 'varchar(8)',
    nullable: false,
  })
  locale!: string;

  @Property({
    name: 'thumbnail_path',
    columnType: 'varchar(255)',
    nullable: true,
  })
  thumbnailPath?: string;
}
