import { AbstractArticle } from '@entities/abstract-article.entity';
import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Source } from '@sources/core/abstract-source';
import * as Constants from '@sources/sources.constants';
import * as Types from '@sources/sources.types';
import { Queue } from 'bullmq';
import { EmbedBuilder, GuildEmoji } from 'discord.js';

export abstract class AbstractSourceService<
  TArticle extends AbstractArticle,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNews = any,
> implements OnModuleInit {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly source: Source,
    protected readonly orm: MikroORM,
    protected readonly subscriptionService: SubscriptionService,
    protected readonly queue: Queue<Types.SourceJobData>,
  ) {}

  onModuleInit() {
    void this.handleCron();
  }

  @Cron(CronExpression.EVERY_HOUR, { timeZone: 'UTC' })
  @CreateRequestContext()
  protected async handleCron() {
    try {
      const unsavedNews = await this.getUnsavedNews();

      if (unsavedNews.length === 0) {
        this.logger.log(Constants.MESSAGES.noNewArticles());
        return;
      } else
        this.logger.log(
          Constants.MESSAGES.foundNewArticles(unsavedNews.length),
        );

      const articles = await this.saveNews(unsavedNews);

      this.logger.log(Constants.MESSAGES.newArticlesSaved(articles.length));

      const channelIds = await this.subscriptionService.getSubscribedChannels(
        this.source,
      );
      const articleIds = articles.map((a) => a.id as number);

      const jobs = channelIds.map((channelId) => ({
        name: `${this.source.id}:${channelId}`,
        data: { channelId, articleIds } as Types.SourceJobData,
      }));

      await this.queue.addBulk(jobs);
      this.logger.log(
        Constants.MESSAGES.enqueuedJobs(jobs.length, articleIds.length),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  public getReactions(): (string | GuildEmoji)[] {
    return ['👍', '😐', '👎'];
  }

  protected abstract getUnsavedNews(): Promise<TNews[]>;
  protected abstract saveNews(news: TNews[]): Promise<TArticle[]>;

  public abstract getArticlesByIds(ids: number[]): Promise<TArticle[]>;
  public abstract buildEmbed(article: TArticle): EmbedBuilder;
}
