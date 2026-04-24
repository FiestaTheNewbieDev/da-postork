import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { contentGridCardsSchema } from '@sources/marvel/marvel.schemas';
import * as Types from '@sources/marvel/marvel.types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MarvelApi {
  constructor(private readonly httpService: HttpService) {}

  public async getContentGridCards(
    componentId: Types.MarvelApiComponentId | (number & {}),
    offset: number = 0,
    limit: number = 4,
  ): Promise<Types.ContentGridCardsResponse> {
    const { data } = await firstValueFrom(
      this.httpService.get<unknown>('/v1/pagination/content_grid_cards', {
        params: {
          componentId,
          offset,
          limit,
          tabIndex: 0,
        },
      }),
    );

    return contentGridCardsSchema.parse(data);
  }
}
