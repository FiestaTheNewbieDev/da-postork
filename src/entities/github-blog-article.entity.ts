import { AbstractArticle } from '@entities/abstract-article.entity';
import { Entity, Filter, Property } from '@mikro-orm/core';

@Entity({
  tableName: 'github_blog_article',
})
@Filter({
  name: 'notDeleted',
  cond: { deletedAt: null },
  default: true,
})
export class GithubBlogArticle extends AbstractArticle {
  @Property({
    name: 'github_blog_link',
    columnType: 'varchar(255)',
    nullable: false,
    unique: true,
  })
  githubBlogLink!: string;

  @Property({
    name: 'description',
    columnType: 'varchar(1024)',
    nullable: true,
  })
  description?: string;

  @Property({
    name: 'thumbnail_filename',
    columnType: 'varchar(255)',
    nullable: true,
  })
  thumbnailFilename?: string;
}
