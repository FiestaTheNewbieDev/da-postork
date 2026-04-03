import { MESSAGES } from '@modules/discord/constants/messages';
import { Injectable, Logger } from '@nestjs/common';
import { Client, Events } from 'discord.js';
import { Context, Once } from 'necord';

@Injectable()
export class ReadyListener {
  private readonly logger = new Logger(ReadyListener.name);

  @Once(Events.ClientReady)
  onReady(@Context() [client]: [Client<true>]) {
    this.logger.log(MESSAGES.ready(client.user.tag));

    if (process.env.NODE_ENV === 'development') {
      client.user.setPresence({ status: 'idle' });
    }
  }
}
