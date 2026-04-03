import { ConfigService } from '@modules/config/config.service';
import { AbstractCommand } from '@modules/discord/misc/abstract-command';
import { AbstractSlashCommand } from '@modules/discord/misc/abstract-slash-command';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  Channel,
  Client,
  Collection,
  Guild,
  GuildChannel,
  IntentsBitField,
  MessageCreateOptions,
} from 'discord.js';

@Injectable()
export class DiscordClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DiscordClientService.name);

  public readonly client: Client;
  public readonly commands = new Collection<string, AbstractCommand>();
  public readonly slashCommands = new Collection<
    string,
    AbstractSlashCommand
  >();

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds, // guild/channel/role events
        IntentsBitField.Flags.GuildMessages, // message create/delete/update events in guilds
        IntentsBitField.Flags.MessageContent, // access message text (privileged — enable in dev portal)
      ],
    });
  }

  public getGuild(guildId: string): Nullable<Guild> {
    return this.client.guilds.cache.get(guildId) || null;
  }

  public getGuilds(): Guild[] {
    return [...this.client.guilds.cache.values()];
  }

  public getGuildChannels(guildId: string): GuildChannel[] {
    const guild = this.getGuild(guildId);
    if (!guild) throw new Error(`Guild ${guildId} not found`);
    return [...guild.channels.cache.values()] as GuildChannel[];
  }

  public getGuildTextChannels(guildId: string): GuildChannel[] {
    const guild = this.getGuild(guildId);
    if (!guild) throw new Error(`Guild ${guildId} not found`);
    return [...guild.channels.cache.values()].filter((c) =>
      c.isTextBased(),
    ) as GuildChannel[];
  }

  public getChannel(channelId: string): Nullable<Channel> {
    return this.client.channels.cache.get(channelId) || null;
  }

  public getChannels(): Channel[] {
    return [...this.client.channels.cache.values()];
  }

  getTextChannels(): Channel[] {
    return this.getChannels().filter((c) => c.isTextBased()) as Channel[];
  }

  /**
   *
   * @deprecated Use channel.send() directly after fetching the channel with getChannel() or getGuildChannels() instead. This method is not only redundant but also inefficient as it fetches the channel again and checks if it's sendable, which should be the responsibility of the caller.
   */
  public sendMessageToChannel(
    channel: Channel | string,
    content: string | MessageCreateOptions,
  ) {
    let _channel: Nullable<Channel> = null;

    if (typeof channel === 'string') {
      _channel = this.getChannel(channel);
      if (!_channel) throw new Error(`Channel ${channel} not found`);
    } else _channel = channel;

    if (!_channel.isSendable())
      throw new Error(`Channel ${_channel.id} is not sendable`);

    return _channel.send(typeof content === 'string' ? { content } : content);
  }

  async onModuleInit() {
    const token = this.configService.get('DISCORD_BOT_TOKEN');
    await this.client.login(token);
  }

  async onModuleDestroy() {
    await this.client.destroy();
  }
}
