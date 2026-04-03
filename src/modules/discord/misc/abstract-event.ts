import { Logger } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

export abstract class AbstractEvent<
  K extends keyof ClientEvents = keyof ClientEvents,
> {
  protected readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  public abstract handle(...args: ClientEvents[K]): void | Promise<void>;
}
