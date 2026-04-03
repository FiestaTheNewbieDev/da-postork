import { MESSAGES } from '@modules/discord/constants/messages';
import {
  DISCORD_COMMAND_METADATA,
  DiscordCommandOptions,
} from '@modules/discord/decorators/discord-command.decorator';
import { AbstractCommand } from '@modules/discord/misc/abstract-command';
import { DiscordClientService } from '@modules/discord/services/discord-client.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

@Injectable()
export class DiscordCommandsService implements OnModuleInit {
  private readonly logger = new Logger(DiscordCommandsService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly discordClientService: DiscordClientService,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const instance = wrapper.instance as Optional<AbstractCommand>;
      const metatype = wrapper.metatype as Optional<
        new (...args: unknown[]) => unknown
      >;
      if (!instance || !metatype) continue;

      const metadata = this.reflector.get<DiscordCommandOptions>(
        DISCORD_COMMAND_METADATA,
        metatype,
      );
      if (!metadata) continue;

      this.discordClientService.commands.set(metadata.name, instance);
      this.logger.log(MESSAGES.commandRegistered(metadata.name));
    }
  }
}
