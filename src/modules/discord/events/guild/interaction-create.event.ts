import { DiscordEvent } from '@modules/discord/decorators/discord-event.decorator';
import { AbstractEvent } from '@modules/discord/misc/abstract-event';
import { DiscordClientService } from '@modules/discord/services/discord-client.service';
import { Injectable } from '@nestjs/common';
import { Interaction } from 'discord.js';

@Injectable()
@DiscordEvent({ name: 'interactionCreate' })
export class InteractionCreateEvent extends AbstractEvent<'interactionCreate'> {
  constructor(private readonly discordClientService: DiscordClientService) {
    super();
  }

  handle(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.discordClientService.slashCommands.get(
      interaction.commandName,
    );
    if (!command) return;

    void command.handle(interaction);
  }
}
