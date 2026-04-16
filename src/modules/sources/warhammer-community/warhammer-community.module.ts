import { WarhammerCommunityArticle } from '@entities/warhammer-community-article.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@modules/config/config.service';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { createSourceConsumer } from '@sources/abstract-source.consumer';
import { WarhammerCommunityApi } from '@sources/warhammer-community/warhammer-community.api';
import * as Constants from '@sources/warhammer-community/warhammer-community.constants';
import { WarhammerCommunityService } from '@sources/warhammer-community/warhammer-community.service';

const WarhammerCommunityConsumer =
  createSourceConsumer<WarhammerCommunityArticle>(
    Constants.WARHAMMER_COMMUNITY_QUEUE,
    WarhammerCommunityService,
  );

@Module({
  imports: [
    SubscriptionModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: Constants.WARHAMMER_COMMUNITY_API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': config.get('USER_AGENT'),
        },
        timeout: 5000,
      }),
    }),
    MikroOrmModule.forFeature([WarhammerCommunityArticle]),
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
