import { SourceId } from '@entities/subscription.entity';
import { fmt as discordFmt } from '@modules/discord/discord.utils';
import { Injectable } from '@nestjs/common';

/**
 * Represents a news source that can be subscribed to via Discord.
 *
 * Each concrete source declares its identity ({@link id}, {@link label},
 * {@link url}) and is registered in the sources registry for autocomplete and
 * subscription resolution.
 */
@Injectable()
export abstract class Source {
  public abstract readonly id: SourceId;
  public abstract readonly label: string;
  public abstract readonly description: Nullable<string>;
  public abstract readonly url: Nullable<string>;

  public toString(): string {
    return this.label;
  }

  /**
   * Returns a Discord-formatted string: the label as inline code, hyperlinked
   * to {@link url} when available.
   */
  public toDiscordString(): string {
    return this.url
      ? discordFmt.link(discordFmt.code(this.label), this.url)
      : discordFmt.code(this.label);
  }
}
