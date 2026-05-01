import { GithubBlogArticle } from '@entities/github-blog-article.entity';
import { SourceId } from '@entities/subscription.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@modules/config/config.service';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { createSourceConsumer } from '@sources/core/abstract-source-consumer';
import { Source } from '@sources/core/source';
import { GithubBlogApi } from './github-blog.api';
import * as Constants from './github-blog.constants';
import { GithubBlogService } from './github-blog.service';

const GithubBlogConsumer = createSourceConsumer<GithubBlogArticle>(
  Constants.GITHUB_BLOG_QUEUE,
  GithubBlogService,
);

@Module({
  imports: [
    SubscriptionModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: Constants.GITHUB_BLOG_WEBSITE_BASE_URL,
        headers: {
          'User-Agent': config.get('USER_AGENT'),
        },
        timeout: 5000,
      }),
    }),
    MikroOrmModule.forFeature([GithubBlogArticle]),
    BullModule.registerQueue({
      name: Constants.GITHUB_BLOG_QUEUE,
      defaultJobOptions: {
        removeOnComplete: { count: 100, age: 24 * 3600 },
        removeOnFail: { count: 500, age: 7 * 24 * 3600 },
      },
    }),
  ],
  providers: [GithubBlogConsumer, GithubBlogService, GithubBlogApi],
  exports: [GithubBlogService],
})
export class GithubBlogModule implements OnModuleInit {
  onModuleInit() {
    Source.register(
      new Source(SourceId.GithubBlog, {
        label: Constants.GITHUB_BLOG_LABEL,
        description: Constants.GITHUB_BLOG_DESCRIPTION,
        url: Constants.GITHUB_BLOG_WEBSITE_BASE_URL,
      }),
    );
  }
}
