import { CodexYGOArticle } from '@entities/codexygo/codexygo-article.entity';
import { CodexYGOCategory } from '@entities/codexygo/codexygo-category.entity';
import { Entity, ManyToOne, Opt, Property, type Rel } from '@mikro-orm/core';

@Entity({ tableName: 'codexygo_article_categories' })
export class CodexYGOArticleCategories {
  @ManyToOne(() => CodexYGOArticle, {
    name: 'article_id',
    primary: true,
    deleteRule: 'cascade',
  })
  article!: Rel<CodexYGOArticle>;

  @ManyToOne(() => CodexYGOCategory, {
    name: 'category_id',
    primary: true,
    deleteRule: 'cascade',
  })
  category!: Rel<CodexYGOCategory>;

  @Property({
    name: 'created_at',
    type: 'timestamp with time zone',
    nullable: false,
    defaultRaw: 'now()',
  })
  readonly createdAt: Opt<Date> = new Date();
}
