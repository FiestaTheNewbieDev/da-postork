/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MESSAGES } from '@warhammer-community/constants/messages';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { WARHAMMER_COMMUNITY_API_URL } from '@warhammer-community/constants/url';
import {
  Category,
  Collection,
  GameSystem,
  Locale,
  News,
  Paginate,
  SortBy,
  Topic,
} from '@warhammer-community/types';
import { firstValueFrom } from 'rxjs';
import { InjectLogger } from '@modules/logger/inject-logger.decorator';

interface IFetchNewsOptions {
  category?: Category;
  collections?: Collection[];
  gameSystems?: GameSystem[];
  index?: string;
  locale?: Locale;
  page?: number;
  perPage?: number;
  sortBy?: SortBy;
  topics?: Topic[];
}

interface IFetchNewsResponse {
  news: News[];
  paginate: Paginate;
}

@Injectable()
export class WarhammerCommunityService {
  constructor(
    private readonly httpService: HttpService,
    @InjectLogger() private readonly logger: Logger,
  ) {}

  public async fetchNews(
    options?: IFetchNewsOptions,
  ): Promise<IFetchNewsResponse> {
    const endpoint = `${WARHAMMER_COMMUNITY_API_URL}/search/news`;

    this.logger.log(MESSAGES['fetching-news'](endpoint));

    const response = await firstValueFrom(
      this.httpService.post<IFetchNewsResponse>(endpoint, {
        category: options?.category || '',
        collections: options?.collections || [Collection.ARTICLES],
        game_systems: options?.gameSystems || [],
        index: options?.index || 'news',
        locale: options?.locale || Locale.EN_GB,
        page: options?.page || 0,
        perPage: options?.perPage || 16,
        sortBy: options?.sortBy || SortBy.DATE_DESC,
        topics: options?.topics || [],
      }),
    );

    return response.data;
  }
}
