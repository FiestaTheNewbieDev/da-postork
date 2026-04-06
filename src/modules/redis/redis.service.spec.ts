import { ConfigService } from '@modules/config/config.service';
import { MESSAGES } from '@modules/redis/redis.constants';
import { RedisService } from '@modules/redis/redis.service';
import { Logger } from '@nestjs/common';
import { createClient } from 'redis';

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

describe(RedisService.name, () => {
  let service: RedisService;
  let configService: { get: jest.Mock };
  let client: { on: jest.Mock; connect: jest.Mock; quit: jest.Mock };

  beforeEach(() => {
    client = {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
    };
    (createClient as jest.Mock).mockReturnValue(client);

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'REDIS_HOST') return 'localhost';
        if (key === 'REDIS_PORT') return 6379;
      }),
    };

    service = new RedisService(configService as unknown as ConfigService);
  });

  it('should create a redis client with the correct url', () => {
    expect(createClient).toHaveBeenCalledWith({
      url: 'redis://localhost:6379',
    });
  });

  it('should log when connected', () => {
    const calls = client.on.mock.calls as Array<
      [string, (...args: unknown[]) => void]
    >;
    const onConnect = calls.find(([event]) => event === 'connect')![1];
    onConnect();

    expect(Logger.prototype.log).toHaveBeenCalledWith(MESSAGES.ready());
  });

  it('should log error on error event', () => {
    const calls = client.on.mock.calls as Array<
      [string, (...args: unknown[]) => void]
    >;
    const onError = calls.find(([event]) => event === 'error')![1];
    const err = new Error('connection failed');
    onError(err);

    expect(Logger.prototype.error).toHaveBeenCalledWith(err);
  });

  describe(RedisService.prototype.onModuleInit.name, () => {
    it('should connect the redis client', async () => {
      await service.onModuleInit();

      expect(client.connect).toHaveBeenCalled();
    });
  });

  describe(RedisService.prototype.onModuleDestroy.name, () => {
    it('should quit the redis client', async () => {
      await service.onModuleDestroy();

      expect(client.quit).toHaveBeenCalled();
    });
  });

  describe(RedisService.prototype.getConnectionOptions.name, () => {
    it('should return host and port', () => {
      expect(service.getConnectionOptions()).toEqual({
        host: 'localhost',
        port: 6379,
      });
    });
  });
});
