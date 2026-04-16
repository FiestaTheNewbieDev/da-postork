import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as Schemas from '@sources/codexygo/codexygo.schemas';
import * as Types from '@sources/codexygo/codexygo.types';
import * as cheerio from 'cheerio';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CodexYGOApi {
  constructor(private readonly httpService: HttpService) {}

  public async getNews(page: number = 1): Promise<Types.InitialServerData> {
    const { data } = await firstValueFrom(
      this.httpService.get<string>(`/?page=${page}`),
    );

    return CodexYGOApi.parseInitialServerData(data);
  }

  private static parseInitialServerData(html: string): Types.InitialServerData {
    const $ = cheerio.load(html);
    const raw = $('#initial-server-data').text();
    return Schemas.initialServerDataSchema.parse(JSON.parse(raw));
  }
}
