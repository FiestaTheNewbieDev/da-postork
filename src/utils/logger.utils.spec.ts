import { fmt } from '@utils/logger.utils';

describe('fmt', () => {
  describe('bold', () => {
    it('should format text in bold', () => {
      expect(fmt.bold('Hello')).toBe('\x1b[1mHello\x1b[0m');
    });
  });
});
