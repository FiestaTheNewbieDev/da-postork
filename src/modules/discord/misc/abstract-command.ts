import { Logger } from '@nestjs/common';
import { Message } from 'discord.js';

export abstract class AbstractCommand {
  protected readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  public abstract handle(
    message: Message,
    args: string[],
  ): void | Promise<void>;
}
