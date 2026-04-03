import { ConfigService } from '@modules/config/config.service';
import { DiscordEvent } from '@modules/discord/decorators/discord-event.decorator';
import { AbstractEvent } from '@modules/discord/misc/abstract-event';
import { DiscordClientService } from '@modules/discord/services/discord-client.service';
import { Injectable } from '@nestjs/common';
import { Message } from 'discord.js';

@Injectable()
@DiscordEvent({ name: 'messageCreate', once: false })
export class MessageCreateEvent extends AbstractEvent<'messageCreate'> {
  constructor(
    private readonly discordClientService: DiscordClientService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  handle(message: Message) {
    if (message.author.bot) return;

    const prefix = this.configService.get('COMMAND_PREFIX');
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = this.discordClientService.commands.get(commandName);
    if (!command) return;

    void command.handle(message, args);
  }
}
