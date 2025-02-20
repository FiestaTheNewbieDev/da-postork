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

export type NewsAPIResponse = {
  news: News[];
  paginate: Paginate;
};
