import { Module } from '@nestjs/common';
import { CodexYGOModule } from '@sources/codexygo/codexygo.module';
import { GundamOfficialModule } from '@sources/gundam-official/gundam-official.module';
import { MarvelModule } from '@sources/marvel/marvel.module';
import { WarhammerCommunityModule } from '@sources/warhammer-community/warhammer-community.module';

@Module({
  imports: [
    CodexYGOModule,
    GundamOfficialModule,
    WarhammerCommunityModule,
    MarvelModule,
  ],
  providers: [],
  exports: [],
})
export class SourcesModule {}
