import { MESSAGES, WARN_MESSAGES } from '@modules/discord/constants/messages';
import {
  DISCORD_EVENT_METADATA,
  DiscordEventOptions,
} from '@modules/discord/decorators/discord-event.decorator';
import { AbstractEvent } from '@modules/discord/misc/abstract-event';
import { DiscordClientService } from '@modules/discord/services/discord-client.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { Client, ClientEvents, Events } from 'discord.js';

@Injectable()
export class DiscordEventsService implements OnModuleInit {
  private readonly logger = new Logger(DiscordEventsService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly discordClientService: DiscordClientService,
  ) {}

  onModuleInit() {
    const client = this.discordClientService.client;
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const instance = wrapper.instance as Optional<AbstractEvent>;
      const metatype = wrapper.metatype as Optional<
        new (...args: unknown[]) => unknown
      >;
      if (!instance || !metatype) continue;

      const metadata = this.reflector.get<DiscordEventOptions>(
        DISCORD_EVENT_METADATA,
        metatype,
      );
      if (!metadata) continue;

      this.registerEvent(client, metadata, instance);

      if (!Object.values(Events).includes(metadata.name as Events))
        this.logger.warn(WARN_MESSAGES.unknownEventRegistered(metadata.name));
      else this.logger.log(MESSAGES.eventRegistered(metadata.name));
    }
  }

  private registerEvent<K extends keyof ClientEvents>(
    client: Client,
    metadata: DiscordEventOptions & { name: K },
    event: AbstractEvent<K>,
  ): void {
    const handler = (...args: ClientEvents[K]) => void event.handle(...args);
    if (metadata.once) client.once(metadata.name, handler);
    else client.on(metadata.name, handler);
  }
}
