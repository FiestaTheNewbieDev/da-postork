import { DiscordModule } from '@discord/discord.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DiscordModule],
})
export class AppModule {}
