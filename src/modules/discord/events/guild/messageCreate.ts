import AbstractEvent from '@discord/misc/AbstractEvent';
import { DiscordClientService } from '@discord/services/discord-client.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from 'discord.js';

const DEFAULT_PREFIX = '!';

@Injectable()
export class MessageCreateEvent extends AbstractEvent {
  constructor(
    private readonly discordClientService: DiscordClientService,
    private readonly configService: ConfigService,
  ) {
    super('messageCreate', false);
  }

  public execute(message: Message) {
    if (message.author.bot) return;

    const prefix = this.configService.get<string>(
      'COMMAND_PREFIX',
      DEFAULT_PREFIX,
    );

    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      const command = this.discordClientService.commands.get(commandName);
      if (!command) return;

      void command.execute(message, args);
    }
  }
}
