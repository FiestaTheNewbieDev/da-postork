import { SourceId } from '@entities/subscription.entity';
import { Source } from '@sources/core/source';

describe(Source.name, () => {
  const TEST_SOURCE_ID = 'TEST' as SourceId;

  beforeEach(() => {
    Source.clearRegistry();
  });

  describe('constructor', () => {
    it('should set id and label', () => {
      const source = new Source(TEST_SOURCE_ID, { label: 'Test' });

      expect(source.id).toBe(TEST_SOURCE_ID);
      expect(source.label).toBe('Test');
    });

    it('should set description and url when provided', () => {
      const source = new Source(TEST_SOURCE_ID, {
        label: 'Test',
        description: 'A description',
        url: 'https://example.com',
      });

      expect(source.description).toBe('A description');
      expect(source.url).toBe('https://example.com');
    });
  });

  describe('register', () => {
    it('should register a source', () => {
      const source = new Source(TEST_SOURCE_ID, { label: 'Test' });
      Source.register(source);

      expect(Source.exists(TEST_SOURCE_ID)).toBe(true);
    });

    it('should throw when registering a duplicate id', () => {
      const source = new Source(TEST_SOURCE_ID, { label: 'Test' });
      Source.register(source);

      expect(() => Source.register(source)).toThrow(
        `Source with id ${TEST_SOURCE_ID} is already registered`,
      );
    });
  });

  describe('getAll', () => {
    it('should return empty array when no sources are registered', () => {
      expect(Source.getAll()).toEqual([]);
    });

    it('should return all registered sources', () => {
      const a = new Source('A' as SourceId, { label: 'A' });
      const b = new Source('B' as SourceId, { label: 'B' });
      Source.register(a);
      Source.register(b);

      expect(Source.getAll()).toEqual([a, b]);
    });
  });

  describe('resolve', () => {
    it('should return the registered source', () => {
      const source = new Source(TEST_SOURCE_ID, { label: 'Test' });
      Source.register(source);

      expect(Source.resolve(TEST_SOURCE_ID)).toBe(source);
    });

    it('should throw for unknown id', () => {
      expect(() => Source.resolve(TEST_SOURCE_ID)).toThrow(
        `Unknown source: ${TEST_SOURCE_ID}`,
      );
    });
  });

  describe('exists', () => {
    it('should return false when source is not registered', () => {
      expect(Source.exists(TEST_SOURCE_ID)).toBe(false);
    });

    it('should return true after registering the source', () => {
      Source.register(new Source(TEST_SOURCE_ID, { label: 'Test' }));

      expect(Source.exists(TEST_SOURCE_ID)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return the label', () => {
      const source = new Source(TEST_SOURCE_ID, { label: 'My Source' });

      expect(source.toString()).toBe('My Source');
    });
  });

  describe('toDiscordString', () => {
    it('should return inline code when url is null', () => {
      const source = new Source(TEST_SOURCE_ID, { label: 'My Source' });

      expect(source.toDiscordString()).toBe('`My Source`');
    });

    it('should return a hyperlinked inline code when url is set', () => {
      const source = new Source(TEST_SOURCE_ID, {
        label: 'My Source',
        url: 'https://example.com',
      });

      expect(source.toDiscordString()).toBe(
        '[`My Source`](https://example.com)',
      );
    });
  });
});
