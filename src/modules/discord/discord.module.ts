import { ConfigModule } from '@modules/config/config.module';
import { ConfigService } from '@modules/config/config.service';
import { DiscordEventsModule } from '@modules/discord/events/discord-events.module';
import { Global, Module } from '@nestjs/common';
import { IntentsBitField } from 'discord.js';
import { NecordModule } from 'necord';

@Global()
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
            IntentsBitField.Flags.DirectMessages,
          ],
          development:
            configService.get('NODE_ENV') === 'development' && devGuildId
              ? [devGuildId]
              : undefined,
        };
      },
    }),
    DiscordEventsModule,
  ],
})
export class DiscordModule {}
