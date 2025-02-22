import { ERROR_MESSAGES } from '@discord/constants/messages';
import AbstractCommand from '@discord/misc/AbstractCommand';
import { InjectLogger } from '@modules/logger/inject-logger.decorator';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Collection, IntentsBitField } from 'discord.js';

@Injectable()
export class DiscordClientService implements OnModuleInit, OnModuleDestroy {
  public readonly client: Client;

  public commands = new Collection<string, AbstractCommand>();

  constructor(
    private readonly configService: ConfigService,
    @InjectLogger() private readonly logger: Logger,
  ) {
    this.client = new Client({
      intents: [IntentsBitField.Flags.Guilds],
    });
  }

  async onModuleInit() {
    const token = this.configService.get<string>('DISCORD_BOT_TOKEN');

    if (!token) {
      this.logger.fatal(ERROR_MESSAGES['no-discord-bot-token']);
      throw new Error(ERROR_MESSAGES['no-discord-bot-token']);
    }

    await this.client.login(token);
  }

  async onModuleDestroy() {
    await this.client.destroy();
  }

  async waitClient(): Promise<boolean> {
    return new Promise((resolve) =>
      this.client.once('ready', () => resolve(true)),
    );
  }
}
