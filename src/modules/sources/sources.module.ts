import { Module } from '@nestjs/common';
import { CodexYGOModule } from '@sources/codexygo/codexygo.module';
import { WarhammerCommunityModule } from '@sources/warhammer-community/warhammer-community.module';

@Module({
  imports: [CodexYGOModule, WarhammerCommunityModule],
})
export class SourcesModule {}
