import { HttpService } from '@nestjs/axios';
import { WarhammerCommunityApi } from '@sources/warhammer-community/warhammer-community.api';
import { of } from 'rxjs';

describe(WarhammerCommunityApi.name, () => {
  let api: WarhammerCommunityApi;
  let httpService: { post: jest.Mock };

  beforeEach(() => {
    httpService = { post: jest.fn() };
    api = new WarhammerCommunityApi(httpService as unknown as HttpService);
  });

  describe(WarhammerCommunityApi.prototype.getNews.name, () => {
    it('should post with default payload', async () => {
      httpService.post.mockReturnValue(of({ data: { news: [] } }));

      await api.getNews();

      expect(httpService.post).toHaveBeenCalledWith('search/news', {
        category: '',
        collections: ['articles'],
        game_systems: [],
        index: 'news',
        locale: 'en-gb',
        page: 0,
        perPage: 16,
        sortBy: 'date_desc',
        topics: [],
      });
    });

    it('should merge provided payload with defaults', async () => {
      httpService.post.mockReturnValue(of({ data: { news: [] } }));

      await api.getNews({ locale: 'de-de', page: 2, perPage: 8 });

      expect(httpService.post).toHaveBeenCalledWith(
        'search/news',
        expect.objectContaining({ locale: 'de-de', page: 2, perPage: 8 }),
      );
    });

    it('should return the response data', async () => {
      const news = [{ id: '1', title: 'Article' }];
      httpService.post.mockReturnValue(of({ data: { news } }));

      const result = await api.getNews();

      expect(result).toEqual({ news });
    });
  });

  describe(WarhammerCommunityApi.prototype.search.name, () => {
    it('should post with default payload', async () => {
      httpService.post.mockReturnValue(of({ data: { hits: [] } }));

      await api.search();

      expect(httpService.post).toHaveBeenCalledWith('search', {
        locale: 'en-gb',
        page: 0,
        searchTerm: '',
        index: 'articles_date_desc',
      });
    });

    it('should add a dateFilter for events indexes', async () => {
      httpService.post.mockReturnValue(of({ data: { hits: [] } }));

      await api.search({ index: 'events_start_date_asc' });

      expect(httpService.post).toHaveBeenCalledWith(
        'search',
        expect.objectContaining({
          index: 'events_start_date_asc',
          dateFilter: expect.stringContaining('AND end_date >=') as string,
        }),
      );
    });

    it('should use the provided dateFilter', async () => {
      httpService.post.mockReturnValue(of({ data: { hits: [] } }));

      await api.search({
        index: 'events_start_date_asc',
        dateFilter: 'custom-filter',
      });

      expect(httpService.post).toHaveBeenCalledWith(
        'search',
        expect.objectContaining({ dateFilter: 'custom-filter' }),
      );
    });

    it('should not add dateFilter for non-events indexes', async () => {
      httpService.post.mockReturnValue(of({ data: { hits: [] } }));

      await api.search({ index: 'articles_date_desc' });

      expect(httpService.post).toHaveBeenCalledWith(
        'search',
        expect.not.objectContaining({
          dateFilter: expect.anything() as unknown,
        }),
      );
    });

    it('should return the response data', async () => {
      const hits = [{ title: 'Article' }];
      httpService.post.mockReturnValue(of({ data: { hits } }));

      const result = await api.search();

      expect(result).toEqual({ hits });
    });
  });
});
