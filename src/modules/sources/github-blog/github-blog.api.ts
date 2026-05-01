import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as Types from '@sources/github-blog/github-blog.types';
import * as cheerio from 'cheerio';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GithubBlogApi {
  constructor(private readonly httpService: HttpService) {}

  public async getArticles(): Promise<Types.Article[]> {
    const response = await firstValueFrom(
      this.httpService.get<string>('/latest'),
    );
    const parsed = GithubBlogApi.parseArticles(response.data);
    console.log(parsed);
    return parsed;
  }

  private static parseArticles(html: string): Types.Article[] {
    const $ = cheerio.load(html);
    const articles: Types.Article[] = [];

    $('article').each((_, el) => {
      const $el = $(el);

      // first <a> is the category title, second <a> is the title link
      const categoryTitle = $el.find('a').eq(0).text();
      console.log('categoryTitle', categoryTitle);

      const title = $el.find('a').eq(1).text().replaceAll(/\s+/g, ' ').trim();
      const link = $el.find('a').eq(1).attr('href');
      const description = $el.find('p').text();
      const thumbnail = $el.find('img').attr('src');
      const publishedAt = $el.find('time').text();

      const authors: string[] = [];
      const footer = $el.find('footer');
      // all <a> in footer which has href that starts with github.blog/author/ are authors
      footer.find('a').each((_, a) => {
        const $a = $(a);
        const href = $a.attr('href');
        if (href?.startsWith('https://github.blog/author/')) {
          const authorName = $a.text();
          authors.push(authorName);
        }
      });
      //
      console.log({
        authors,
        categoryTitle,
        link,
        title,
        description,
        thumbnail,
        publishedAt,
      });

      if (link && title) {
        articles.push({
          categoryTitle,
          link,
          title,
          description,
          thumbnail,
          publishedAt,
          authors,
        });
      }
    });

    return articles;
  }
}
