import { ConfigService } from '@modules/config/config.service';
import { MESSAGES, WARN_MESSAGES } from '@modules/discord/constants/messages';
import {
  DISCORD_SLASH_COMMAND_METADATA,
  DiscordSlashCommandOptions,
} from '@modules/discord/decorators/discord-slash-command.decorator';
import { DiscordClientService } from '@modules/discord/services/discord-client.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { REST, Routes } from 'discord.js';

@Injectable()
export class DiscordDeployService implements OnModuleInit {
  private readonly logger = new Logger(DiscordDeployService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly discordClientService: DiscordClientService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.discordClientService.client.once('clientReady', (client) => {
      void this.deploy(client.application.id);
    });
  }

  private async deploy(applicationId: string) {
    const token = this.configService.get('DISCORD_BOT_TOKEN');
    const devGuildId = this.configService.get('DEV_GUILD_ID');

    const commandData = this.collectCommandData();
    const rest = new REST().setToken(token);

    if (!devGuildId) {
      if (process.env.NODE_ENV === 'development')
        this.logger.warn(WARN_MESSAGES.noDevGuildId());
      await rest.put(Routes.applicationCommands(applicationId), {
        body: commandData,
      });
      this.logger.log(MESSAGES.commandsDeployed('globally'));
    } else {
      await rest.put(
        Routes.applicationGuildCommands(applicationId, devGuildId),
        { body: commandData },
      );
      this.logger.log(MESSAGES.commandsDeployed(devGuildId));
    }
  }

  private collectCommandData(): Pick<
    DiscordSlashCommandOptions,
    'name' | 'description' | 'options'
  >[] {
    return this.discoveryService.getProviders().flatMap((wrapper) => {
      const metatype = wrapper.metatype as Optional<
        new (...args: unknown[]) => unknown
      >;
      if (!metatype) return [];

      const metadata = this.reflector.get<DiscordSlashCommandOptions>(
        DISCORD_SLASH_COMMAND_METADATA,
        metatype,
      );
      if (!metadata) return [];

      return [
        {
          name: metadata.name,
          description: metadata.description,
          options: metadata.options,
        },
      ];
    });
  }
}
