import { ConfigModule } from '@modules/config/config.module';
import { ConfigService } from '@modules/config/config.service';
import { DiscordListenersModule } from '@modules/discord/listeners/discord-listeners.module';
import { Module } from '@nestjs/common';
import { IntentsBitField } from 'discord.js';
import { NecordModule } from 'necord';

@Module({
  imports: [
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const devGuildId = configService.get('DEV_GUILD_ID');
        return {
          token: configService.get('DISCORD_BOT_TOKEN'),
          intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent,
          ],
          development: devGuildId ? [devGuildId] : undefined,
        };
      },
    }),
    DiscordListenersModule,
  ],
})
export class DiscordModule {}
