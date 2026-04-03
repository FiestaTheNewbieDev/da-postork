import { ConfigService } from '@modules/config/config.service';
import { MESSAGES } from '@modules/discord/constants/messages';
import { DiscordEvent } from '@modules/discord/decorators/discord-event.decorator';
import { AbstractEvent } from '@modules/discord/misc/abstract-event';
import { Injectable } from '@nestjs/common';
import { Client } from 'discord.js';

@Injectable()
@DiscordEvent({ name: 'clientReady', once: true })
export class ReadyEvent extends AbstractEvent<'clientReady'> {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  handle(client: Client<true>) {
    this.logger.log(MESSAGES.ready(client.user.tag));

    if (this.configService.get('NODE_ENV') === 'development')
      client.user.setPresence({
        status: 'idle',
      });
  }
}
