import { CodexYGOArticle } from '@entities/codexygo-article.entity';
import { SubscriptionSource } from '@entities/subscription.entity';
import { MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { AbstractSourceService } from '@sources/abstract-source.service';
import { CodexYGOApi } from '@sources/codexygo/codexygo.api';
import * as Constants from '@sources/codexygo/codexygo.constants';
import { SourceJobData } from '@sources/sources.types';
import { Queue } from 'bullmq';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class CodexYGOService extends AbstractSourceService<
  CodexYGOArticle,
  unknown
> {
  constructor(
    private readonly api: CodexYGOApi,
    @InjectRepository(CodexYGOArticle)
    private readonly articleRepo: EntityRepository<CodexYGOArticle>,
    orm: MikroORM,
    subscriptionService: SubscriptionService,
    @InjectQueue(Constants.CODEXYGO_QUEUE)
    queue: Queue<SourceJobData>,
  ) {
    super(orm, subscriptionService, queue);
  }

  protected getSubscriptionSource(): SubscriptionSource {
    return SubscriptionSource.CodexYGO;
  }

  protected getUnsavedNews(): Promise<unknown[]> {
    throw new NotImplementedException();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected saveNews(news: unknown[]): Promise<CodexYGOArticle[]> {
    throw new NotImplementedException();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getArticlesByIds(ids: number[]): Promise<CodexYGOArticle[]> {
    throw new NotImplementedException();
  }

  public buildEmbed(article: CodexYGOArticle): EmbedBuilder {
    return new EmbedBuilder().setTitle(article.title);
  }
}
