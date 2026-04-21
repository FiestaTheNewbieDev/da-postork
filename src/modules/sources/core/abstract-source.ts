import { SourceId } from '@entities/subscription.entity';
import { fmt as discordFmt } from '@modules/discord/discord.utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class Source {
  public abstract readonly id: SourceId;
  public abstract readonly label: string;
  public abstract readonly description: Nullable<string>;
  public abstract readonly url: Nullable<string>;

  public toString(): string {
    return this.label;
  }

  public toDiscordString(): string {
    return discordFmt.code(
      this.url ? discordFmt.link(this.label, this.url) : this.label,
    );
  }
}
