export enum Locale {
  EN_GB = 'en-gb',
  EN_US = 'en-us',
  DE_DE = 'de-de',
}

export enum GameSystem {
  WARHAMMER_40000 = 'warhammer-40000',
  WARHAMMER_AGE_OF_SIGMAR = 'warhammer-age-of-sigmar',
  WARHAMMER_THE_HORUS_HERESY = 'warhammer-the-horus-heresy',
  WARHAMMER_THE_OLD_WORLD = 'warhammer-the-old-world',
  BLACK_LIBRARY = 'black-library',
  KILL_TEAM = 'kill-team',
  NECROMUNDA = 'necromunda',
  WARCRY = 'warcry',
  WARHAMMER_UNDERWORLDS = 'warhammer-underworlds',
  LEGIONS_IMPERIALIS = 'legions-imperialis',
  ADEPTUS_TITANICUS = 'adeptus-titanicus',
  AERONAUTICA_IMPERIALIS = 'aeronautica-imperialis',
  BLOOD_BOWL = 'blood-bowl',
  MIDDLE_EARTH_STRATEGY_BATTLE_GAME = 'middle-earth-strategy-battle-game',
}

export enum Category {
  INTERVIEWS = 'interviews',
  VIDEO_GAMES = 'video-games',
  READING = 'reading',
  BUILDING_PAINTING = 'building-painting',
  WATCHING = 'watching',
  PAINTING_VIDEOS = 'painting-videos',
  ANIMATIONS = 'animations',
}

export enum SortBy {
  DATE_DESC = 'date_desc',
  DATE_ASC = 'date_asc',
  TITLE_DESC = 'title_desc',
  TITLE_ASC = 'title_asc',
}

export enum Collection {
  ARTICLES = 'articles',
  VIDEOS = 'videos',
}

export type Image = {
  path: string;
  alt: Nullable<string>;
  width: number;
  height: number;
  focus: string;
};

export type Topic = {
  title: string;
  slug: string;
};

export type News = {
  title: string;
  slug: string;
  excerpt: string;
  image: Image;
  collection: string;
  topics: Topic[];
  date: string;
  interaction_time: string;
  uri: string;
  id: string;
  uuid: string;
};

export type Paginate = {
  total_items: number;
  items_per_page: number;
  total_pages: number;
  current_page: number;
};
