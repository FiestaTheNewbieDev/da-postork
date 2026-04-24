import { AbstractArticle } from '@entities/abstract-article.entity';
import { Entity, Enum, Filter, Property } from '@mikro-orm/core';

export enum MarvelArticleCategory {
  Movies = 'MOVIES',
  Comics = 'COMICS',
  TvShows = 'TV_SHOWS',
  Games = 'GAMES',
  DigitalSeries = 'DIGITAL_SERIES',
  CultureAndLifestyle = 'CULTURE_AND_LIFESTYLE',
  Podcast = 'PODCAST',
}

@Entity({
  tableName: 'marvel_article',
})
@Filter({
  name: 'notDeleted',
  cond: { deletedAt: null },
  default: true,
})
export class MarvelArticle extends AbstractArticle {
  @Property({
    name: 'marvel_link',
    columnType: 'varchar(255)',
    nullable: false,
    unique: true,
  })
  marvelLink!: string;

  @Property({
    name: 'description',
    columnType: 'varchar(1024)',
    nullable: true,
  })
  description?: string;

  @Enum({
    name: 'category',
    items: () => MarvelArticleCategory,
    nativeEnumName: 'marvel_article_category',
    nullable: false,
  })
  category!: string;

  @Property({
    name: 'thumbnail_filename',
    columnType: 'varchar(255)',
    nullable: true,
  })
  thumbnailFilename?: string;
}
