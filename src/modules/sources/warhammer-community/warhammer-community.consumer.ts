import { WarhammerCommunityArticle } from '@entities/warhammer-community-article.entity';
import { MikroORM } from '@mikro-orm/core';
import { Processor } from '@nestjs/bullmq';
import { AbstractSourceConsumer } from '@sources/abstract-source.consumer';
import * as Constants from '@sources/warhammer-community/warhammer-community.constants';
import { WarhammerCommunityService } from '@sources/warhammer-community/warhammer-community.service';
import { Client } from 'discord.js';

@Processor(Constants.WARHAMMER_COMMUNITY_QUEUE, {
  concurrency: 4,
})
export class WarhammerCommunityConsumer extends AbstractSourceConsumer<WarhammerCommunityArticle> {
  constructor(
    orm: MikroORM,
    client: Client,
    warhammerCommunityService: WarhammerCommunityService,
  ) {
    super(orm, client, warhammerCommunityService);
  }
}
