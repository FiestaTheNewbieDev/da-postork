import { CodexYGOArticle } from '@entities/codexygo-article.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DiscordModule } from '@modules/discord/discord.module';
import { SubscriptionModule } from '@modules/subscription/subscription.module';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CodexYGOApi } from '@sources/codexygo/codexygo.api';
import * as Constants from '@sources/codexygo/codexygo.constants';
import { CodexYGOConsumer } from '@sources/codexygo/codexygo.consumer';
import { CodexYGOService } from '@sources/codexygo/codexygo.service';

@Module({
  imports: [
    SubscriptionModule,
    HttpModule.register({
      baseURL: Constants.CODEXYGO_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    }),
    DiscordModule,
    MikroOrmModule.forFeature([CodexYGOArticle]),
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
