import { MarvelArticle } from '@entities/marvel-article.entity';
import { SourceId } from '@entities/subscription.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@modules/config/config.service';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { createSourceConsumer } from '@sources/core/abstract-source-consumer';
import { Source } from '@sources/core/source';
import { MarvelApi } from './marvel.api';
import * as Constants from './marvel.constants';
import { MarvelService } from './marvel.service';

const MarvelConsumer = createSourceConsumer<MarvelArticle>(
  Constants.MARVEL_QUEUE,
  MarvelService,
);

@Module({
  imports: [
    SubscriptionModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: Constants.MARVEL_WEBSITE_BASE_URL,
        headers: {
          'User-Agent': config.get('USER_AGENT'),
        },
        timeout: 5000,
      }),
    }),
    MikroOrmModule.forFeature([MarvelArticle]),
    BullModule.registerQueue({
      name: Constants.MARVEL_QUEUE,
      defaultJobOptions: {
        removeOnComplete: { count: 100, age: 24 * 3600 },
        removeOnFail: { count: 500, age: 7 * 24 * 3600 },
      },
    }),
  ],
  providers: [MarvelConsumer, MarvelService, MarvelApi],
  exports: [MarvelService],
})
export class MarvelModule implements OnModuleInit {
  onModuleInit() {
    Source.register(
      new Source(SourceId.Marvel, {
        label: Constants.MARVEL_LABEL,
        description: Constants.MARVEL_DESCRIPTION,
        url: Constants.MARVEL_WEBSITE_BASE_URL,
      }),
    );
  }
}
