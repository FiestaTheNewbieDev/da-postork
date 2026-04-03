import { Logger } from '@nestjs/common';
import { ChatInputCommandInteraction } from 'discord.js';

export abstract class AbstractSlashCommand {
  protected readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  public abstract handle(
    interaction: ChatInputCommandInteraction,
  ): void | Promise<void>;
}
