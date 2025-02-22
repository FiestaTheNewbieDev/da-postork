import COMMANDS from '@discord/commands';
import EVENTS from '@discord/events';
import { DiscordChannelService } from '@discord/services/discord-channel.service';
import { DiscordClientService } from '@discord/services/discord-client.service';
import { DiscordCommandsService } from '@discord/services/discord-commands.service';
import { DiscordEventsService } from '@discord/services/discord-events.service';
import { LoggerModule } from '@modules/logger/logger.module';
import { Module } from '@nestjs/common';

const DiscordEvents = Object.values(EVENTS);
const DiscordCommands = Object.values(COMMANDS);

const PROVIDERS = [
  DiscordClientService,
  DiscordEventsService,
  DiscordCommandsService,
  DiscordChannelService,
  ...DiscordEvents,
  ...DiscordCommands,
];

@Module({
  imports: [
    LoggerModule.forRoot({
      moduleName: DiscordModule.name,
      providers: PROVIDERS,
    }),
  ],
  providers: PROVIDERS,
})
export class DiscordModule {}
