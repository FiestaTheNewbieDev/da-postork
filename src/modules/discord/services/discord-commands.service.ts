import COMMANDS from '@discord/commands';
import { MESSAGES } from '@discord/constants/messages';
import AbstractCommand from '@discord/misc/AbstractCommand';
import { DiscordClientService } from '@discord/services/discord-client.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class DiscordCommandsService implements OnModuleInit {
  private logger = new Logger(DiscordCommandsService.name);

  constructor(
    private readonly discordClientService: DiscordClientService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    for (const CommandConstructor of Object.values(COMMANDS)) {
      let command: AbstractCommand;
      try {
        command = this.moduleRef.get(CommandConstructor, { strict: false });
      } catch (error) {
        this.logger.error(
          `Failed to get command instance: ${CommandConstructor.name}`,
        );
        console.error(error);
        continue;
      }

      this.discordClientService.commands.set(command.name, command);

      this.logger.log(MESSAGES['command-loaded'](command.name));
    }
  }
}
