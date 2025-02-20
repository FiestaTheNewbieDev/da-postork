import { DiscordModule } from '@discord/discord.module';
import { WarhammerCommunityModule } from '@warhammer-community/warhammer-community.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DiscordModule,
    WarhammerCommunityModule,
  ],
})
export class AppModule {}
