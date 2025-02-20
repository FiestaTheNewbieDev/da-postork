import AbstractEvent from '@discord/misc/AbstractEvent';
import { DiscordClientService } from '@discord/services/discord-client.service';
import { Injectable } from '@nestjs/common';
import { Message } from 'discord.js';

const PREFIX = '!';

@Injectable()
export class MessageCreateEvent extends AbstractEvent {
  constructor(private readonly discordClientService: DiscordClientService) {
    super('messageCreate', false);
  }

  public execute(message: Message) {
    if (message.author.bot) return;

    if (message.content.startsWith(PREFIX)) {
      const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      const command = this.discordClientService.commands.get(commandName);
      if (!command) return;

      command.execute(message, args);
    }
  }
}
