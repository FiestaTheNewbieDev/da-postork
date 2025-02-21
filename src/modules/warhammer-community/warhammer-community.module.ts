import { WarhammerCommunityService } from '@warhammer-community/services/warhammer-community.service';
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PollingService } from '@warhammer-community/services/polling.service';
import { LoggerModule } from '@modules/logger/logger.module';

const PROVIDERS = [WarhammerCommunityService, PollingService];

@Global()
@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    LoggerModule.forRoot(WarhammerCommunityModule, PROVIDERS),
  ],
  providers: PROVIDERS,
  exports: [WarhammerCommunityService],
})
export class WarhammerCommunityModule {}
