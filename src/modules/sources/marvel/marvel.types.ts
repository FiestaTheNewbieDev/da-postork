import { z } from 'zod';
import * as Schemas from './marvel.schemas';

export type Article = z.infer<typeof Schemas.articleSchema>;

export type ContentGridCardsResponse = z.infer<
  typeof Schemas.contentGridCardsSchema
>;

export enum MarvelApiComponentId {
  MovieNews = 552871,
  ComicsNews = 552916,
  TvShowNews = 552946,
  GameNews = 625781,
  DigitalSeriesNews = 553006,
  CultureAndLifestyleNews = 552976,
  PodcastNews = 553081,
}
