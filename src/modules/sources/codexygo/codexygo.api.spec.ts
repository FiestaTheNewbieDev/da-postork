import { HttpService } from '@nestjs/axios';
import { CodexYGOApi } from '@sources/codexygo/codexygo.api';
import { of } from 'rxjs';

describe(CodexYGOApi.name, () => {
  let api: CodexYGOApi;
  let httpService: { get: jest.Mock };

  beforeEach(() => {
    httpService = { get: jest.fn() };
    api = new CodexYGOApi(httpService as unknown as HttpService);
  });

  describe(CodexYGOApi.prototype.getNews.name, () => {
    const makeHtml = (data: object) =>
      `<div id="initial-server-data">${JSON.stringify(data)}</div>`;

    const emptyData = {
      recentArticleCount: 0,
      recentArticleIds: [],
      pinnedCategoryIds: [],
      pinnedCategoryArticleIdsRecord: {},
      articleRecord: {},
      categoryRecord: {},
      memberRecord: {},
    };

    it('should get page 1 by default', async () => {
      httpService.get.mockReturnValue(of({ data: makeHtml(emptyData) }));

      await api.getNews();

      expect(httpService.get).toHaveBeenCalledWith('/?page=1');
    });

    it('should get the provided page', async () => {
      httpService.get.mockReturnValue(of({ data: makeHtml(emptyData) }));

      await api.getNews(3);

      expect(httpService.get).toHaveBeenCalledWith('/?page=3');
    });

    it('should return the parsed initial server data', async () => {
      const data = { ...emptyData, recentArticleCount: 42 };
      httpService.get.mockReturnValue(of({ data: makeHtml(data) }));

      const result = await api.getNews();

      expect(result).toEqual(data);
    });
  });
});
