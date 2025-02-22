import { WarhammerCommunityService } from '@warhammer-community/services/warhammer-community.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from '@modules/logger/logger.module';

const PROVIDERS = [WarhammerCommunityService];

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      moduleName: WarhammerCommunityModule.name,
      providers: PROVIDERS,
    }),
  ],
  providers: PROVIDERS,
  exports: [WarhammerCommunityService],
})
export class WarhammerCommunityModule {}
