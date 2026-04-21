import { Subscription } from '@entities/subscription.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RedisModule } from '@modules/redis/redis.module';
import { SourceAutocompleteInterceptor } from '@modules/subscription/source-autocomplete.interceptor';
import { SubscriptionCommands } from '@modules/subscription/subscription.commands';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { forwardRef, Module } from '@nestjs/common';
import { SourcesModule } from '@sources/sources.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Subscription]),
    RedisModule,
    forwardRef(() => SourcesModule),
  ],
  providers: [
    SubscriptionService,
    SubscriptionCommands,
    SourceAutocompleteInterceptor,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
