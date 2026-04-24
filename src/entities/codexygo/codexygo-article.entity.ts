import { AbstractArticle } from '@entities/abstract-article.entity';
import { CodexYGOArticleCategories } from '@entities/codexygo/codexygo-article-categories.entity';
import { CodexYGOCategory } from '@entities/codexygo/codexygo-category.entity';
import { CodexYGOMember } from '@entities/codexygo/codexygo-member.entity';
import {
  Collection,
  Entity,
  Filter,
  ManyToMany,
  ManyToOne,
  Property,
  type Rel,
} from '@mikro-orm/core';

@Entity({
  tableName: 'codexygo_article',
})
@Filter({
  name: 'notDeleted',
  cond: { deletedAt: null },
  default: true,
})
export class CodexYGOArticle extends AbstractArticle {
  @Property({
    name: 'codexygo_oid',
    type: 'integer',
    nullable: false,
    unique: true,
  })
  readonly codexygoOid!: number;

  @Property({
    name: 'codexygo_slug',
    columnType: 'varchar(255)',
    nullable: false,
  })
  readonly codexygoSlug!: string;

  @Property({ name: 'teaser', columnType: 'varchar(512)', nullable: true })
  teaser?: string;

  @Property({
    name: 'tags',
    columnType: 'jsonb',
    nullable: false,
  })
  tags!: string[];

  @ManyToMany(() => CodexYGOCategory, undefined, {
    pivotEntity: () => CodexYGOArticleCategories,
  })
  categories = new Collection<CodexYGOCategory>(this);

  @Property({
    name: 'thumbnail_id',
    type: 'integer',
    nullable: true,
  })
  thumbnailId?: number;

  @ManyToOne(() => CodexYGOMember, {
    name: 'creator_id',
    nullable: false,
  })
  creator!: Rel<CodexYGOMember>;
}
