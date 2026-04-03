import { MESSAGES } from '@modules/discord/constants/messages';
import {
  DISCORD_SLASH_COMMAND_METADATA,
  DiscordSlashCommandOptions,
} from '@modules/discord/decorators/discord-slash-command.decorator';
import { AbstractSlashCommand } from '@modules/discord/misc/abstract-slash-command';
import { DiscordClientService } from '@modules/discord/services/discord-client.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

@Injectable()
export class DiscordSlashCommandsService implements OnModuleInit {
  private readonly logger = new Logger(DiscordSlashCommandsService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly discordClientService: DiscordClientService,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const instance = wrapper.instance as Optional<AbstractSlashCommand>;
      const metatype = wrapper.metatype as Optional<
        new (...args: unknown[]) => unknown
      >;
      if (!instance || !metatype) continue;

      const metadata = this.reflector.get<DiscordSlashCommandOptions>(
        DISCORD_SLASH_COMMAND_METADATA,
        metatype,
      );
      if (!metadata) continue;

      this.discordClientService.slashCommands.set(metadata.name, instance);
      this.logger.log(MESSAGES.commandRegistered(metadata.name));
    }
  }
}
