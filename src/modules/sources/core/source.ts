import { SourceId } from '@entities/subscription.entity';
import { fmt as discordFmt } from '@modules/discord/discord.utils';
import z from 'zod';

/**
 * Represents a news source that can be subscribed to via Discord.
 *
 * Each concrete source declares its identity ({@link id}, {@link label},
 * {@link url}) and is registered in the sources registry for autocomplete and
 * subscription resolution.
 */
export class Source {
  private static readonly registry = new Map<SourceId, Source>();

  public readonly id: SourceId;
  public readonly label: string;
  public readonly description: Nullish<string>;
  public readonly url: Nullish<string>;

  constructor(id: SourceId, metadata: SourceMetadata) {
    this.id = id;

    const parsedMetadata = sourceMetadataSchema.parse(metadata);

    this.label = parsedMetadata.label;
    this.description = parsedMetadata.description;
    this.url = parsedMetadata.url;
  }

  public static register(source: Source): void {
    const id = source.id;

    if (Source.registry.has(id))
      throw new Error(`Source with id ${id} is already registered`);

    Source.registry.set(id, source);
  }

  public static getAll(): Source[] {
    return Array.from(Source.registry.values());
  }

  public static resolve(id: SourceId): Source {
    const source = Source.registry.get(id);
    if (!source) throw new Error(`Unknown source: ${id}`);
    return source;
  }

  public static exists(id: SourceId): boolean {
    return Source.registry.has(id);
  }

  public static clearRegistry(): void {
    Source.registry.clear();
  }

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

const sourceMetadataSchema = z.object({
  label: z.string().nonempty(),
  description: z.string().nonempty().nullish(),
  url: z.url().nonempty().nullish(),
});

type SourceMetadata = z.infer<typeof sourceMetadataSchema>;
