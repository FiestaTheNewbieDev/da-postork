import { AbstractArticle } from '@entities/abstract-article.entity';
import { Entity, Filter, Property } from '@mikro-orm/core';

@Entity({
  tableName: 'gundam_official_article',
})
@Filter({
  name: 'notDeleted',
  cond: { deletedAt: null },
  default: true,
})
export class GundamOfficialArticle extends AbstractArticle {
  @Property({
    name: 'gundam_official_document_id',
    columnType: 'varchar(64)',
    nullable: false,
    unique: true,
  })
  readonly gundamOfficialDocumentId!: string;

  @Property({
    name: 'gundam_official_slug',
    columnType: 'varchar(255)',
    nullable: true,
  })
  readonly gundamOfficialSlug?: string;

  @Property({ name: 'title', columnType: 'varchar(255)', nullable: false })
  title!: string;

  @Property({
    name: 'thumbnail_url',
    columnType: 'varchar(255)',
    nullable: false,
  })
  thumbnailUrl!: string;
}
