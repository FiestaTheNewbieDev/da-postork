import { AbstractArticle } from '@entities/abstract-article.entity';
import { GundamOfficialArticle } from '@entities/gundam-official-article.entity';
import { SourceId } from '@entities/subscription.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@modules/config/config.service';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { createSourceConsumer } from '@sources/core/abstract-source-consumer';
import { Source } from '@sources/core/source';
import { GundamOfficialApi } from '@sources/gundam-official/gundam-official.api';
import * as Constants from '@sources/gundam-official/gundam-official.constants';
import { GundamOfficialService } from '@sources/gundam-official/gundam-official.service';

const GundamOfficialConsumer = createSourceConsumer<AbstractArticle>(
  Constants.GUNDAM_OFFICIAL_QUEUE,
  GundamOfficialService,
);

@Module({
  imports: [
    SubscriptionModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: Constants.GUNDAM_OFFICIAL_WEBSITE_BASE_URL,
        headers: {
          'User-Agent': config.get('USER_AGENT'),
        },
        timeout: 5000,
      }),
    }),
    MikroOrmModule.forFeature([GundamOfficialArticle]),
    BullModule.registerQueue({
      name: Constants.GUNDAM_OFFICIAL_QUEUE,
      defaultJobOptions: {
        removeOnComplete: { count: 100, age: 24 * 3600 },
        removeOnFail: { count: 500, age: 7 * 24 * 3600 },
      },
    }),
  ],
  providers: [GundamOfficialConsumer, GundamOfficialService, GundamOfficialApi],
  exports: [GundamOfficialService],
})
export class GundamOfficialModule implements OnModuleInit {
  onModuleInit() {
    Source.register(
      new Source(SourceId.GundamOfficial, {
        label: Constants.GUNDAM_OFFICIAL_LABEL,
        description: Constants.GUNDAM_OFFICIAL_DESCRIPTION,
        url: Constants.GUNDAM_OFFICIAL_WEBSITE_BASE_URL,
      }),
    );
  }
}
