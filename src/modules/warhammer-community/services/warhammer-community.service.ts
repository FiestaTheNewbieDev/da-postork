import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { News, NewsAPIResponse } from '@warhammer-community/types';
import { firstValueFrom } from 'rxjs';

const WEBSITE_BASE_URL = 'https://www.warhammer-community.com';
const API_BASE_URL = `${WEBSITE_BASE_URL}/api`;

@Injectable()
export class WarhammerCommunityService {
  private readonly logger = new Logger(WarhammerCommunityService.name);

  constructor(private readonly httpService: HttpService) {}

  public async fetchNews(): Promise<News[]> {
    const url = `${API_BASE_URL}/search/news`;

    const response = await firstValueFrom(
      this.httpService.post<NewsAPIResponse>(url, {
        category: '',
        collections: ['articles', 'videos'],
        game_systems: ['warhammer-40000'],
        index: 'news',
        locale: 'en-gb',
        page: 0,
        perPage: 10,
        sortBy: 'date_desc',
        topics: ['warhammer-40000'],
      }),
    );

    return response.data.news;
  }

  public composeUrl(uri: string, locale: string = 'en-gb'): string {
    return `${WEBSITE_BASE_URL}/${locale}/${uri}`;
  }
}
