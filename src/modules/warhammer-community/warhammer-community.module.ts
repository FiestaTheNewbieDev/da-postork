import { WarhammerCommunityService } from '@warhammer-community/services/warhammer-community.service';
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [HttpModule],
  providers: [WarhammerCommunityService],
  exports: [WarhammerCommunityService],
})
export class WarhammerCommunityModule {}
