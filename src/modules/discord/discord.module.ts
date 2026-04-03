import { ReadyEvent } from '@modules/discord/events/client/ready.event';
import { InteractionCreateEvent } from '@modules/discord/events/guild/interaction-create.event';
import { MessageCreateEvent } from '@modules/discord/events/guild/message-create.event';
import { DiscordClientService } from '@modules/discord/services/discord-client.service';
import { DiscordCommandsService } from '@modules/discord/services/discord-commands.service';
import { DiscordDeployService } from '@modules/discord/services/discord-deploy.service';
import { DiscordEventsService } from '@modules/discord/services/discord-events.service';
import { DiscordSlashCommandsService } from '@modules/discord/services/discord-slash-commands.service';
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule],
  providers: [
    DiscordClientService,
    DiscordEventsService,
    DiscordCommandsService,
    DiscordSlashCommandsService,
    DiscordDeployService,
    // Events
    ReadyEvent,
    MessageCreateEvent,
    InteractionCreateEvent,
  ],
  exports: [DiscordClientService],
})
export class DiscordModule {}
