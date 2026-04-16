import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as Schemas from '@sources/warhammer-community/warhammer-community.schemas';
import * as Types from '@sources/warhammer-community/warhammer-community.types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WarhammerCommunityApi {
  constructor(private readonly httpService: HttpService) {}

  public async getNews(
    payload: Partial<Types.GetNewsPayload> = {},
  ): Promise<Types.GetNewsResponse> {
    const _payload: Types.GetNewsPayload = {
      category: payload.category || '',
      collections: payload.collections || ['articles'],
      game_systems: payload.game_systems || [],
      index: payload.index || 'news',
      locale: payload.locale || 'en-gb',
      page: payload.page || 0,
      perPage: payload.perPage || 16,
      sortBy: payload.sortBy || 'date_desc',
      topics: payload.topics || [],
    };

    const { data } = await firstValueFrom(
      this.httpService.post<unknown>(`search/news`, _payload),
    );

    return Schemas.getNewsResponseSchema.parse(data);
  }

  public async search(
    payload: Partial<Types.SearchPayload> = {},
  ): Promise<Types.SearchResponse> {
    const _payload: Types.SearchPayload = {
      locale: payload.locale || 'en-gb',
      page: payload.page || 0,
      searchTerm: payload.searchTerm || '',
      index: payload.index || 'articles_date_desc',
    } as Types.SearchPayload;

    if (
      (
        [
          'events_start_date_asc',
          'events_start_date_desc',
          'events_title_asc',
          'events_title_desc',
        ] as Types.SearchPayload['index'][]
      ).includes(_payload.index)
    )
      _payload.dateFilter =
        payload.dateFilter || `AND end_date >= ${new Date().getTime()}`;

    const { data } = await firstValueFrom(
      this.httpService.post<Types.SearchResponse>(`search`, _payload),
    );

    return data;
  }
}
