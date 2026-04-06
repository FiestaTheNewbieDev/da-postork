import { ConfigService } from '@modules/config/config.service';
import { MESSAGES } from '@modules/discord/discord.constants';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client, Events } from 'discord.js';
import { Context, Once } from 'necord';

@Injectable()
export class ReadyEvent {
  private readonly logger = new Logger(ReadyEvent.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Once(Events.ClientReady)
  handle(@Context() [client]: [Client<true>]) {
    this.logger.log(MESSAGES.ready(client.user.tag));

    if (this.configService.get('NODE_ENV') === 'development') {
      client.user.setPresence({ status: 'idle' });
    }

    this.eventEmitter.emit('bot.ready');
  }
}
