import { Module } from '@nestjs/common';
import { CodexYGOModule } from '@sources/codexygo/codexygo.module';
import { CodexYGOSource } from '@sources/codexygo/codexygo.source';
import { GundamOfficialModule } from '@sources/gundam-official/gundam-official.module';
import { GundamOfficialSource } from '@sources/gundam-official/gundam-official.source';
import { SOURCES } from '@sources/sources.constants';
import { SourcesService } from '@sources/sources.service';
import { WarhammerCommunityModule } from '@sources/warhammer-community/warhammer-community.module';
import { WarhammerCommunitySource } from '@sources/warhammer-community/warhammer-community.source';

@Module({
  imports: [CodexYGOModule, GundamOfficialModule, WarhammerCommunityModule],
  providers: [
    {
      provide: SOURCES,
      useFactory: (
        codexygo: CodexYGOSource,
        gundam: GundamOfficialSource,
        warhammer: WarhammerCommunitySource,
      ) => [codexygo, gundam, warhammer],
      inject: [CodexYGOSource, GundamOfficialSource, WarhammerCommunitySource],
    },
    SourcesService,
  ],
  exports: [SOURCES, SourcesService],
})
export class SourcesModule {}
