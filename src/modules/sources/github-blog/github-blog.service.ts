import { GithubBlogArticle } from '@entities/github-blog-article.entity';
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
import { GithubBlogApi } from '@sources/github-blog/github-blog.api';
import * as Constants from '@sources/github-blog/github-blog.constants';
import * as Types from '@sources/github-blog/github-blog.types';
import { SourceJobData } from '@sources/sources.types';
import { Queue } from 'bullmq';

@Injectable()
export class GithubBlogService extends AbstractSourceService<
  GithubBlogArticle,
  Types.Article
> {
  constructor(
    private readonly api: GithubBlogApi,
    @InjectRepository(GithubBlogArticle)
    articleRepo: EntityRepository<GithubBlogArticle>,
    orm: MikroORM,
    subscriptionService: SubscriptionService,
    @InjectQueue(Constants.GITHUB_BLOG_QUEUE)
    queue: Queue<SourceJobData>,
    schedulerRegistry: SchedulerRegistry,
  ) {
    super(orm, articleRepo, subscriptionService, queue, schedulerRegistry);
  }

  protected get source(): Source {
    return Source.resolve(SourceId.GithubBlog);
  }

  protected async getUnsavedNews(): Promise<Types.Article[]> {
    const results = await this.api.getArticles();

    const existing = await this.articleRepo.find(
      { githubBlogLink: { $in: results.map((r) => r.link) } },
      { orderBy: { publishedAt: 'asc' } },
    );

    return results.filter(
      (result) =>
        !existing.some((article) => article.githubBlogLink === result.link),
    );
  }

  protected async saveNews(
    news: Types.Article[],
  ): Promise<GithubBlogArticle[]> {
    const articles = news.map((article) =>
      this.articleRepo.create({
        githubBlogLink: article.link,
        title: article.title,
        description: article.description,
        thumbnailFilename: article.thumbnail,
        publishedAt: new Date(article.publishedAt),
      }),
    );

    await this.articleRepo.getEntityManager().flush();

    return articles;
  }

  protected buildArticleUrl(article: GithubBlogArticle): string {
    return new URL(
      article.githubBlogLink,
      Constants.GITHUB_BLOG_WEBSITE_BASE_URL,
    ).toString();
  }
}
