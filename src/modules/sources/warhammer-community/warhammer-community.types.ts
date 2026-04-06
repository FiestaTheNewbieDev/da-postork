export type Collection = 'articles';

export type Locale = 'en-gb' | 'de-de';

export type Image = {
  path: string;
  alt: Nullable<string>;
  width: number;
  height: number;
  focus: string;
};

export type GameSystem = {
  title?:
    | 'Warhammer 40,000'
    | 'Warhammer: The Horus Heresy'
    | 'Warhammer Plus'
    | 'Warhammer Age of Sigmar'
    | 'Black Library'
    | 'White Dwarf'
    | (string & {});
  light: Image;
  dark: Image;
};

export type Topic = {
  title: string;
  slug: string;
};

export type News = {
  title: string;
  site: Locale | (string & {});
  slug: string;
  excerpt: string;
  image: Image;
  collection: Collection | (string & {});
  game_system: GameSystem;
  topics: Topic[];
  date: string;
  hide_date: boolean;
  hide_read_time: boolean;
  interaction_time: string;
  uri: string;
  id: string;
  uuid: string;
};

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
    game_systems: NonNullable<GameSystem['title']>[];
    excerpt: string;
    topics: Topic['title'][];
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

export type GetNewsResponse = {
  news: News[];
};
