import {
  MarvelArticle,
  MarvelArticleCategory,
} from '@entities/marvel-article.entity';
import { SourceId } from '@entities/subscription.entity';
import { MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AbstractSourceService } from '@sources/core/abstract-source-service';
import { Source } from '@sources/core/source';
import { MarvelApi } from '@sources/marvel/marvel.api';
import * as Constants from '@sources/marvel/marvel.constants';
import * as Types from '@sources/marvel/marvel.types';
import { SourceJobData } from '@sources/sources.types';
import { Queue } from 'bullmq';

@Injectable()
export class MarvelService extends AbstractSourceService<
  MarvelArticle,
  Types.Article
> {
  constructor(
    private readonly api: MarvelApi,
    @InjectRepository(MarvelArticle)
    articleRepo: EntityRepository<MarvelArticle>,
    orm: MikroORM,
    subscriptionService: SubscriptionService,
    @InjectQueue(Constants.MARVEL_QUEUE)
    queue: Queue<SourceJobData>,
    schedulerRegistry: SchedulerRegistry,
  ) {
    super(orm, articleRepo, subscriptionService, queue, schedulerRegistry);
  }

  protected get source(): Source {
    return Source.resolve(SourceId.Marvel);
  }

  protected override get schedules() {
    return [{ expression: '0 18 * * *', timezone: 'America/New_York' }];
  }

  protected async getUnsavedNews(): Promise<Types.Article[]> {
    const componentIds = [
      Types.MarvelApiComponentId.MovieNews,
      Types.MarvelApiComponentId.ComicsNews,
      Types.MarvelApiComponentId.TvShowNews,
      Types.MarvelApiComponentId.GameNews,
      Types.MarvelApiComponentId.DigitalSeriesNews,
      Types.MarvelApiComponentId.CultureAndLifestyleNews,
      Types.MarvelApiComponentId.PodcastNews,
    ];

    const promises = componentIds.map((componentId) =>
      this.api
        .getContentGridCards(componentId, 0, 4)
        .then((response) => response.data.results.data),
    );

    const seen = new Set<string>();
    const results = (await Promise.all(promises)).flat().filter((article) => {
      if (seen.has(article.link.link)) return false;
      seen.add(article.link.link);
      return true;
    });

    const existing = await this.articleRepo.find(
      { marvelLink: { $in: results.map((r) => r.link.link) } },
      { orderBy: { publishedAt: 'asc' } },
    );

    return results.filter(
      (result) =>
        !existing.some((article) => article.marvelLink === result.link.link),
    );
  }

  protected async saveNews(news: Types.Article[]): Promise<MarvelArticle[]> {
    const articles = news.map((article) =>
      this.articleRepo.create({
        marvelLink: article.link.link,
        title: article.headline,
        category: MarvelService.convertCategoryIntoEnum(article.category.title),
        description: article.description,
        thumbnailFilename: article.image.filename,
        publishedAt: new Date(article.timestamp),
      }),
    );

    await this.articleRepo.getEntityManager().flush();

    return articles;
  }

  public static convertCategoryIntoEnum(
    category: string,
  ): MarvelArticleCategory {
    switch (category) {
      case 'Movies':
        return MarvelArticleCategory.Movies;
      case 'Comics':
        return MarvelArticleCategory.Comics;
      case 'TV Shows':
        return MarvelArticleCategory.TvShows;
      case 'Games':
        return MarvelArticleCategory.Games;
      case 'Digital Series':
        return MarvelArticleCategory.DigitalSeries;
      case 'Culture & Lifestyle':
        return MarvelArticleCategory.CultureAndLifestyle;
      case 'Podcasts':
        return MarvelArticleCategory.Podcast;
      default:
        throw new Error(`Unknown category: ${category}`);
    }
  }

  protected override buildDescription(
    article: MarvelArticle,
  ): Nullable<string> {
    return article.description || null;
  }

  protected buildArticleUrl(article: MarvelArticle): string {
    return new URL(
      article.marvelLink,
      Constants.MARVEL_WEBSITE_BASE_URL,
    ).toString();
  }

  protected override buildThumbnailUrl(
    article: MarvelArticle,
  ): Nullable<string> {
    return article.thumbnailFilename
      ? MarvelService.buildImageUrl(article.thumbnailFilename)
      : null;
  }

  public static buildImageUrl(fileName: string): string {
    const url = new URL(fileName, Constants.MARVEL_CDN_BASE_URL).toString();
    console.log(`Built image URL: ${url}`);
    return url;
  }
}
