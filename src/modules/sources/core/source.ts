import { SourceId } from '@entities/subscription.entity';
import { fmt as discordFmt } from '@modules/discord/discord.utils';
import z from 'zod';

/**
 * Represents a news source that can be subscribed to via Discord.
 *
 * Each source has a unique {@link id} and a human-readable {@link label}. Sources
 * are registered in a static registry used for autocomplete and subscription
 * resolution.
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

  /**
   * Registers a source. Throws if a source with the same id is already
   * registered.
   */
  public static register(source: Source): void {
    const id = source.id;

    if (Source.registry.has(id))
      throw new Error(`Source with id ${id} is already registered`);

    Source.registry.set(id, source);
  }

  /** Returns all registered sources. */
  public static getAll(): Source[] {
    return Array.from(Source.registry.values());
  }

  /** Returns the source for the given id. Throws if not found. */
  public static resolve(id: SourceId): Source {
    const source = Source.registry.get(id);
    if (!source) throw new Error(`Unknown source: ${id}`);
    return source;
  }

  /** Returns whether a source with the given id is registered. */
  public static exists(id: SourceId): boolean {
    return Source.registry.has(id);
  }

  /** Clears the registry. Intended for use in tests. */
  public static clearRegistry(): void {
    Source.registry.clear();
  }

  public toString(): string {
    return this.label;
  }

  /**
   * Returns a Discord-formatted string: the label as inline code, hyperlinked
   * to {@link url} when a URL is available.
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
