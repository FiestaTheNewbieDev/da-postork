import { ConfigService } from '@modules/config/config.service';
import { ReadyEvent } from '@modules/discord/events/ready.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client } from 'discord.js';

describe(ReadyEvent.name, () => {
  let readyEvent: ReadyEvent;
  let configService: { get: jest.Mock };
  let eventEmitter: { emit: jest.Mock };
  let client: { user: { tag: string; setPresence: jest.Mock } };

  beforeEach(() => {
    configService = { get: jest.fn() };
    eventEmitter = { emit: jest.fn() };
    client = { user: { tag: 'TestBot#1234', setPresence: jest.fn() } };

    readyEvent = new ReadyEvent(
      configService as unknown as ConfigService,
      eventEmitter as unknown as EventEmitter2,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe(ReadyEvent.prototype.handle.name, () => {
    it('should emit bot.ready', () => {
      readyEvent.handle([client as unknown as Client<true>]);

      expect(eventEmitter.emit).toHaveBeenCalledWith('bot.ready');
    });

    it('should set presence to idle in development', () => {
      configService.get.mockReturnValue('development');

      readyEvent.handle([client as unknown as Client<true>]);

      expect(client.user.setPresence).toHaveBeenCalledWith({ status: 'idle' });
    });

    it('should not set presence outside of development', () => {
      configService.get.mockReturnValue('production');

      readyEvent.handle([client as unknown as Client<true>]);

      expect(client.user.setPresence).not.toHaveBeenCalled();
    });
  });
});
