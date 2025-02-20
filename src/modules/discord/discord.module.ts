import COMMANDS from '@discord/commands';
import EVENTS from '@discord/events';
import { DiscordClientService } from '@discord/services/discord-client.service';
import { DiscordCommandsService } from '@discord/services/discord-commands.service';
import { DiscordEventsService } from '@discord/services/discord-events.service';
import { Module } from '@nestjs/common';

const DiscordEvents = Object.values(EVENTS);
const DiscordCommands = Object.values(COMMANDS);

@Module({
  providers: [
    DiscordClientService,
    DiscordEventsService,
    DiscordCommandsService,
    ...DiscordEvents,
    ...DiscordCommands,
  ],
})
export class DiscordModule {}
