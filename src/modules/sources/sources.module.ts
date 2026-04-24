import { Module } from '@nestjs/common';
import { CodexYGOModule } from '@sources/codexygo/codexygo.module';
import { GundamOfficialModule } from '@sources/gundam-official/gundam-official.module';
import { WarhammerCommunityModule } from '@sources/warhammer-community/warhammer-community.module';

@Module({
  imports: [CodexYGOModule, GundamOfficialModule, WarhammerCommunityModule],
  providers: [],
  exports: [],
})
export class SourcesModule {}
