import { Subscription } from '@entities/subscription.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RedisModule } from '@modules/redis/redis.module';
import { SubscriptionCommands } from '@modules/subscription/subscription.commands';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [MikroOrmModule.forFeature([Subscription]), RedisModule],
  providers: [SubscriptionService, SubscriptionCommands],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
