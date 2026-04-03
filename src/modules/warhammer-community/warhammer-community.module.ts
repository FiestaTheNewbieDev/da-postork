import { WarhammerCommunityArticle } from '@entities/warhammer-community-article.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WarhammerCommunityApi } from '@modules/warhammer-community/warhammer-community.api';
import * as Constants from '@modules/warhammer-community/warhammer-community.constants';
import { WarhammerCommunityConsumer } from '@modules/warhammer-community/warhammer-community.consumer';
import { WarhammerCommunityService } from '@modules/warhammer-community/warhammer-community.service';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forFeature([WarhammerCommunityArticle]),
    HttpModule.register({
      baseURL: 'https://www.warhammer-community.com/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    }),
    BullModule.registerQueue({
      name: Constants.WARHAMMER_COMMUNITY_QUEUE,
      defaultJobOptions: {
        removeOnComplete: { count: 100, age: 24 * 3600 },
        removeOnFail: { count: 500, age: 7 * 24 * 3600 },
      },
    }),
  ],
  providers: [
    WarhammerCommunityService,
    WarhammerCommunityApi,
    WarhammerCommunityConsumer,
  ],
  exports: [],
})
export class WarhammerCommunityModule {}
