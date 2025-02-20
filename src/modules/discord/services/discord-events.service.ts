import EVENT_NAMES from '@discord/constants/eventNames';
import { ERROR_MESSAGES, MESSAGES } from '@discord/constants/messages';
import EVENTS from '@discord/events';
import AbstractEvent from '@discord/misc/AbstractEvent';
import { DiscordClientService } from '@discord/services/discord-client.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class DiscordEventsService implements OnModuleInit {
  private logger = new Logger(DiscordEventsService.name);

  constructor(
    private readonly discordClientService: DiscordClientService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    const client = this.discordClientService.client;

    for (const EventConstructor of Object.values(EVENTS)) {
      let event: AbstractEvent;
      try {
        event = this.moduleRef.get(EventConstructor, { strict: false });
      } catch (error) {
        this.logger.error(
          `Failed to get event instance: ${EventConstructor.name}`,
        );
        console.error(error);
        continue;
      }

      if (!EVENT_NAMES.includes(event.name)) {
        this.logger.error(ERROR_MESSAGES['unknown-event'](event.name));
        continue;
      }

      if (event.once)
        client.once(event.name, (...args: any[]) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          event.execute(...args),
        );
      else
        client.on(event.name, (...args: any[]) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          event.execute(...args),
        );

      this.logger.log(MESSAGES['event-loaded'](event.name));
    }
  }
}
