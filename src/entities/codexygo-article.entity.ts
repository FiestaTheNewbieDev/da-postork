import { AbstractArticle } from '@entities/abstract-article.entity';
import { Entity, Filter, Property } from '@mikro-orm/core';

@Entity({
  tableName: 'codexygo_article',
})
@Filter({
  name: 'notDeleted',
  cond: { deletedAt: null },
  default: true,
})
export class CodexYGOArticle extends AbstractArticle {
  @Property({ name: 'title', columnType: 'varchar(255)', nullable: false })
  title!: string;
}
