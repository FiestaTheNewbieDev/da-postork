import { z } from 'zod';
import * as Schemas from './warhammer-community.schemas';

export type Locale = z.infer<typeof Schemas.localeSchema>;
export type Collection = z.infer<typeof Schemas.collectionSchema>;
export type Image = z.infer<typeof Schemas.imageSchema>;
export type GameSystemTitle = z.infer<typeof Schemas.gameSystemTitleSchema>;
export type GameSystem = z.infer<typeof Schemas.gameSystemSchema>;
export type Topic = z.infer<typeof Schemas.topicSchema>;
export type News = z.infer<
  typeof Schemas.getNewsResponseSchema
>['news'][number];
export type GetNewsResponse = z.infer<typeof Schemas.getNewsResponseSchema>;

export type SearchPayload = {
  locale: Locale | (string & {});
  page: number;
  searchTerm: string;
} & (
  | {
      index:
        | 'articles_date_desc'
        | 'articles_date_asc'
        | 'articles_title_asc'
        | 'articles_title_desc'
        | 'downloads_v2_date_desc'
        | 'downloads_v2_date_asc'
        | 'downloads_v2_title_asc'
        | 'downloads_v2_title_desc'
        | 'videos_date_desc'
        | 'videos_date_asc'
        | 'videos_title_asc'
        | 'videos_title_desc'
        | (string & {});
      dateFilter: never;
    }
  | {
      index:
        | 'events_start_date_asc'
        | 'events_start_date_desc'
        | 'events_title_asc'
        | 'events_title_desc';
      dateFilter: string;
    }
);

export type SearchResponse = {
  hits: {
    title: string;
    game_systems: string[];
    excerpt: string;
    topics: string[];
    locale: Locale | (string & {});
    date: number;
    id: News;
  }[];
};

export type GetNewsPayload = {
  category:
    | ''
    | 'interviews'
    | 'video-games'
    | 'reading'
    | 'building-painting'
    | 'watching'
    | (string & {});
  collections: (Collection | (string & {}))[];
  game_systems: string[];
  index: 'news' | (string & {});
  locale: Locale | (string & {});
  page: number;
  perPage: number;
  sortBy: 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc';
  topics: string[];
};
