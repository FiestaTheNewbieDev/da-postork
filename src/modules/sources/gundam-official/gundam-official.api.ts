import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as Errors from '@sources/gundam-official/gundam-official.errors';
import * as Schemas from '@sources/gundam-official/gundam-official.schemas';
import * as Types from '@sources/gundam-official/gundam-official.types';
import * as cheerio from 'cheerio';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GundamOfficialApi {
  private readonly logger = new Logger(GundamOfficialApi.name);

  constructor(private readonly httpService: HttpService) {}

  public async getNews(
    page: number = 1,
  ): Promise<Types.NewsPageData['newsResponse']> {
    const { data } = await firstValueFrom(
      this.httpService.get<string>(`/news?page=${page}`),
    );

    return GundamOfficialApi.parseNewsPage(data).newsResponse;
  }

  private static extractNextFPayload(content: string): Nullable<string> {
    const raw: Optional<string> = content.match(
      /self\.__next_f\.push\(\[1,(".*")\]\)/s,
    )?.[1];
    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (typeof parsed !== 'string') return null;

    const colonIndex = parsed.indexOf(':');
    if (colonIndex === -1) return null;

    return parsed.slice(colonIndex + 1);
  }

  private static findNewsScript($: cheerio.CheerioAPI): Nullable<string> {
    for (const tag of $('script').toArray()) {
      const content = $(tag).html();
      if (content?.includes('newsResponse')) return content;
    }
    return null;
  }

  private static parseNewsPage(html: string): Types.NewsPageData {
    const $ = cheerio.load(html);

    const scriptContent = GundamOfficialApi.findNewsScript($);
    if (!scriptContent) throw new Errors.ScriptNotFoundError();

    const jsonStr = GundamOfficialApi.extractNextFPayload(scriptContent);
    if (!jsonStr) throw new Errors.PayloadExtractionError();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (cause) {
      throw new Errors.JsonParseError(cause);
    }
    const result = Schemas.newsPageDataSchema.safeParse(
      (parsed as unknown[])[3],
    );
    if (!result.success) throw new Errors.SchemaValidationError(result.error);

    return result.data;
  }
}
