import { SubscriptionSource } from '@entities/subscription.entity';
import { fmt } from '@modules/discord/discord.utils';
import { SOURCES_MAP } from '@modules/subscription/subscription.constants';

describe('fmt', () => {
  describe('user', () => {
    it('should format user mentions correctly', () => {
      expect(fmt.user('123456789')).toBe('<@123456789>');
    });
  });

  describe('channel', () => {
    it('should format channel mentions correctly', () => {
      expect(fmt.channel('987654321')).toBe('<#987654321>');
    });
  });

  describe('code', () => {
    it('should format code snippets correctly', () => {
      expect(fmt.code('console.log("Hello, world!");')).toBe(
        '`console.log("Hello, world!");`',
      );
    });
  });

  describe('bold', () => {
    it('should format bold text correctly', () => {
      expect(fmt.bold('Bold Text')).toBe('**Bold Text**');
    });
  });

  describe('source', () => {
    it('should format sources correctly', () => {
      expect(fmt.source(SubscriptionSource.WarhammerCommunity)).toBe(
        `[\`${SOURCES_MAP.WARHAMMER_COMMUNITY.label}\`](${SOURCES_MAP.WARHAMMER_COMMUNITY.url})`,
      );
    });
  });
});
