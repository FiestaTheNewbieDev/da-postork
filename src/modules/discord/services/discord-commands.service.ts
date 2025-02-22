import COMMANDS from '@discord/commands';
import { ERROR_MESSAGES, MESSAGES } from '@discord/constants/messages';
import AbstractCommand from '@discord/misc/AbstractCommand';
import { DiscordClientService } from '@discord/services/discord-client.service';
import { InjectLogger } from '@modules/logger/inject-logger.decorator';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class DiscordCommandsService implements OnModuleInit {
  constructor(
    private readonly discordClientService: DiscordClientService,
    private readonly moduleRef: ModuleRef,
    @InjectLogger() private readonly logger: Logger,
  ) {}

  onModuleInit() {
    for (const CommandConstructor of Object.values(COMMANDS)) {
      let command: AbstractCommand;
      try {
        command = this.moduleRef.get(CommandConstructor, { strict: false });
      } catch (error) {
        this.logger.error(
          ERROR_MESSAGES['get-command-instance-failed'](
            CommandConstructor.name,
          ),
        );
        console.error(error);
        continue;
      }

      this.discordClientService.commands.set(command.name, command);

      this.logger.log(MESSAGES['command-loaded'](command.name));
    }
  }
}
