import * as Entities from '@entities/codexygo';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@modules/config/config.service';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { createSourceConsumer } from '@sources/abstract-source.consumer';
import { CodexYGOApi } from '@sources/codexygo/codexygo.api';
import * as Constants from '@sources/codexygo/codexygo.constants';
import { CodexYGOService } from '@sources/codexygo/codexygo.service';

const CodexYGOConsumer = createSourceConsumer<Entities.CodexYGOArticle>(
  Constants.CODEXYGO_QUEUE,
  CodexYGOService,
);

@Module({
  imports: [
    SubscriptionModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: Constants.CODEXYGO_WEBSITE_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': config.get('USER_AGENT'),
        },
        timeout: 5000,
      }),
    }),
    MikroOrmModule.forFeature(Object.values(Entities)),
    BullModule.registerQueue({
      name: Constants.CODEXYGO_QUEUE,
      defaultJobOptions: {
        removeOnComplete: { count: 100, age: 24 * 3600 },
        removeOnFail: { count: 500, age: 7 * 24 * 3600 },
      },
    }),
  ],
  providers: [CodexYGOConsumer, CodexYGOApi, CodexYGOService],
  exports: [],
})
export class CodexYGOModule {}
