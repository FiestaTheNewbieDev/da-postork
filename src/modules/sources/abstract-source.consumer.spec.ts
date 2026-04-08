import { AbstractArticle } from '@entities/abstract-article.entity';
import { MikroORM } from '@mikro-orm/core';
import { AbstractSourceConsumer } from '@sources/abstract-source.consumer';
import { AbstractSourceService } from '@sources/abstract-source.service';
import * as Constants from '@sources/sources.constants';
import * as Types from '@sources/sources.types';
import { Job } from 'bullmq';
import { Client } from 'discord.js';

jest.mock('@mikro-orm/core', () => ({
  ...jest.requireActual<typeof import('@mikro-orm/core')>('@mikro-orm/core'),
  CreateRequestContext:
    () =>
    (_target: object, _key: string | symbol, descriptor: PropertyDescriptor) =>
      descriptor,
}));

jest.mock('@nestjs/bullmq', () => ({
  WorkerHost: class {
    protected worker = { pause: jest.fn(), resume: jest.fn() };
  },
}));

jest.mock('discord.js', () => {
  const actual = jest.requireActual<typeof import('discord.js')>('discord.js');

  class GuildChannel {
    isSendable = jest.fn().mockReturnValue(true);
    permissionsFor = jest.fn();
    send = jest.fn();
  }

  return { ...actual, GuildChannel };
});

type MockGuildChannel = {
  isSendable: jest.Mock;
  permissionsFor: jest.Mock;
  send: jest.Mock;
};

const { GuildChannel } = jest.requireMock<{
  GuildChannel: new () => MockGuildChannel;
}>('discord.js');

class TestArticle extends AbstractArticle {}
class TestConsumer extends AbstractSourceConsumer<TestArticle> {}

describe(AbstractSourceConsumer.name, () => {
  let consumer: TestConsumer;
  let discordClient: {
    channels: { cache: { get: jest.Mock } };
    user: object;
  };
  let sourceService: { getArticlesByIds: jest.Mock; buildEmbed: jest.Mock };
  let worker: { pause: jest.Mock; resume: jest.Mock };

  const makeJob = (channelId: string, articleIds: number[]) =>
    ({ data: { channelId, articleIds } }) as Job<Types.SourceJobData>;

  beforeEach(() => {
    discordClient = {
      channels: { cache: { get: jest.fn() } },
      user: {},
    };
    sourceService = {
      getArticlesByIds: jest.fn(),
      buildEmbed: jest.fn().mockReturnValue({}),
    };

    consumer = new TestConsumer(
      {} as MikroORM,
      discordClient as unknown as Client,
      sourceService as unknown as AbstractSourceService<TestArticle>,
    );

    worker = (consumer as unknown as { worker: typeof worker }).worker;
  });

  describe('onModuleInit', () => {
    it('should pause the worker', () => {
      consumer.onModuleInit();

      expect(worker.pause).toHaveBeenCalled();
    });
  });

  describe('onBotReady', () => {
    it('should resume the worker', () => {
      consumer.onBotReady();

      expect(worker.resume).toHaveBeenCalled();
    });
  });

  describe('process', () => {
    it('should throw when channel is not found', async () => {
      discordClient.channels.cache.get.mockReturnValue(undefined);

      await expect(consumer.process(makeJob('111', [1]))).rejects.toThrow(
        Constants.ERROR_MESSAGES.channelNotFound('111'),
      );
    });

    it('should throw when channel is not sendable', async () => {
      const channel = { isSendable: jest.fn().mockReturnValue(false) };
      discordClient.channels.cache.get.mockReturnValue(channel);

      await expect(consumer.process(makeJob('111', [1]))).rejects.toThrow(
        Constants.ERROR_MESSAGES.channelNotSendable('111'),
      );
    });

    it('should throw when GuildChannel is missing embed permissions', async () => {
      const channel = new GuildChannel();
      channel.permissionsFor.mockReturnValue({
        has: jest.fn().mockReturnValue(false),
      });
      discordClient.channels.cache.get.mockReturnValue(channel);

      await expect(consumer.process(makeJob('111', [1]))).rejects.toThrow(
        Constants.ERROR_MESSAGES.missingEmbedPermissions('111'),
      );
    });

    it('should send embeds and react for a non-GuildChannel', async () => {
      const message = { react: jest.fn().mockResolvedValue(undefined) };
      const channel = {
        isSendable: jest.fn().mockReturnValue(true),
        send: jest.fn().mockResolvedValue(message),
      };
      discordClient.channels.cache.get.mockReturnValue(channel);
      sourceService.getArticlesByIds.mockResolvedValue([
        { id: 1 } as TestArticle,
      ]);

      await consumer.process(makeJob('111', [1]));

      expect(channel.send).toHaveBeenCalledTimes(1);
      expect(message.react).toHaveBeenCalledWith('👍');
      expect(message.react).toHaveBeenCalledWith('😐');
      expect(message.react).toHaveBeenCalledWith('👎');
    });

    it('should send embeds and react for a GuildChannel with add reactions permission', async () => {
      const message = { react: jest.fn().mockResolvedValue(undefined) };
      const channel = new GuildChannel();
      channel.permissionsFor.mockReturnValue({
        has: jest.fn().mockReturnValue(true),
      });
      channel.send.mockResolvedValue(message);
      discordClient.channels.cache.get.mockReturnValue(channel);
      sourceService.getArticlesByIds.mockResolvedValue([
        { id: 1 } as TestArticle,
      ]);

      await consumer.process(makeJob('111', [1]));

      expect(channel.send).toHaveBeenCalledTimes(1);
      expect(message.react).toHaveBeenCalledWith('👍');
      expect(message.react).toHaveBeenCalledWith('😐');
      expect(message.react).toHaveBeenCalledWith('👎');
    });

    it('should send embeds without reacting for a GuildChannel missing add reactions permission', async () => {
      const message = { react: jest.fn() };
      const channel = new GuildChannel();
      const has = jest
        .fn()
        .mockReturnValueOnce(true) // SEND_EMBED
        .mockReturnValueOnce(false); // ADD_REACTIONS
      channel.permissionsFor.mockReturnValue({ has });
      channel.send.mockResolvedValue(message);
      discordClient.channels.cache.get.mockReturnValue(channel);
      sourceService.getArticlesByIds.mockResolvedValue([
        { id: 1 } as TestArticle,
      ]);

      await consumer.process(makeJob('111', [1]));

      expect(channel.send).toHaveBeenCalledTimes(1);
      expect(message.react).not.toHaveBeenCalled();
    });

    it('should throw when send fails', async () => {
      const channel = {
        isSendable: jest.fn().mockReturnValue(true),
        send: jest.fn().mockRejectedValue(new Error('send failed')),
      };
      discordClient.channels.cache.get.mockReturnValue(channel);
      sourceService.getArticlesByIds.mockResolvedValue([
        { id: 1 } as TestArticle,
      ]);

      await expect(consumer.process(makeJob('111', [1]))).rejects.toThrow(
        Constants.ERROR_MESSAGES.sendMessageFailed('111', 1),
      );
    });
  });
});
