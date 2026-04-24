import { AbstractArticle } from '@entities/abstract-article.entity';
import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Source } from '@sources/core/source';
import * as Constants from '@sources/sources.constants';
import * as Types from '@sources/sources.types';
import { Queue } from 'bullmq';
import { CronJob } from 'cron';
import { EmbedBuilder, GuildEmoji } from 'discord.js';

/**
 * Abstract base service for news sources.
 *
 * Handles the full fetch→save→enqueue pipeline on a configurable set of cron
 * schedules. Each concrete source must implement the data-fetching and
 * persistence logic via {@link getUnsavedNews} and {@link saveNews}.
 *
 * Discord embed construction is handled by {@link buildEmbed}, which composes
 * three overridable hooks: {@link buildDescription}, {@link buildThumbnailUrl},
 * and {@link buildArticleUrl} (abstract). Override {@link buildEmbed} directly
 * for deeper customisation (e.g. adding author or footer fields).
 *
 * @template TArticle - The MikroORM entity type for this source's articles.
 * @template TNews - The raw API response type before persistence.
 */
export abstract class AbstractSourceService<
  TArticle extends AbstractArticle,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNews = any,
> implements OnModuleInit {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly orm: MikroORM,
    protected readonly articleRepo: EntityRepository<TArticle>,
    protected readonly subscriptionService: SubscriptionService,
    protected readonly queue: Queue<Types.SourceJobData>,
    protected readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.schedules.forEach(({ expression, timezone }, index) => {
      const job = CronJob.from({
        cronTime: expression,
        onTick: () => void this.process(),
        timeZone: timezone,
      });
      this.schedulerRegistry.addCronJob(
        `${this.constructor.name}:${index}`,
        job,
      );
      job.start();
    });

    void this.process();
  }

  /** Returns the cron schedules to register. Override to customize. */
  protected get schedules(): Types.CronSchedule[] {
    return [{ expression: '0 * * * *', timezone: 'UTC' }];
  }

  /**
   * Fetches unsaved articles, persists them, then enqueues one BullMQ job per
   * subscribed channel so the consumer can post Discord embeds independently.
   */
  @CreateRequestContext()
  private async process() {
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

  /**
   * Returns the emoji reactions added to each posted article.
   *
   * Override to customize reactions for a specific source. Defaults to 👍 / 😐
   * / 👎.
   */
  public getReactions(): (string | GuildEmoji)[] {
    return ['👍', '😐', '👎'];
  }

  protected abstract get source(): Source;

  /**
   * Fetches articles from the external source and filters out already-persisted
   * ones.
   *
   * @returns Raw news items not yet present in the database.
   */
  protected abstract getUnsavedNews(): Promise<TNews[]>;

  /**
   * Persists raw news items and returns the created entities.
   *
   * @param news - Raw items returned by {@link getUnsavedNews}.
   * @returns The newly created article entities.
   */
  protected abstract saveNews(news: TNews[]): Promise<TArticle[]>;

  /**
   * Retrieves persisted articles by their IDs.
   *
   * Override to add relations (e.g. `populate`) or change ordering.
   *
   * @param ids - Article IDs to fetch.
   * @returns The matching article entities.
   */
  public getArticlesByIds(ids: number[]): Promise<TArticle[]> {
    return this.articleRepo.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      { id: { $in: ids } } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      { orderBy: { publishedAt: 'asc' } as any },
    );
  }

  /**
   * Builds a Discord embed for a single article.
   *
   * Calls {@link buildDescription}, {@link buildThumbnailUrl}, and
   * {@link buildArticleUrl} to populate the embed fields. Override this method
   * to add extra fields (e.g. author, footer) on top of the base embed, or to
   * replace the structure entirely.
   *
   * @param article - The article to format.
   * @returns A Discord.js {@link EmbedBuilder} ready to be sent.
   */
  public buildEmbed(article: TArticle): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(article.title)
      .setDescription(this.buildDescription(article))
      .setImage(this.buildThumbnailUrl(article))
      .setURL(this.buildArticleUrl(article))
      .addFields({
        name: '\u200B',
        value: article.publishedAt.toDateString(),
      });
  }

  /**
   * Returns the embed description for an article. Override to populate it —
   * returns `null` by default (no description).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected buildDescription(article: TArticle): Nullable<string> {
    return null;
  }

  /**
   * Returns the canonical URL of the article on the source website. Used as the
   * embed link.
   */
  protected abstract buildArticleUrl(article: TArticle): string;

  /**
   * Returns the URL of the thumbnail image for the embed. Override to populate
   * it — returns `null` by default (no thumbnail).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected buildThumbnailUrl(article: TArticle): Nullable<string> {
    return null;
  }
}
