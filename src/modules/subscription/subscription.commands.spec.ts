import { SourceId } from '@entities/subscription.entity';
import { subscriptionFactory } from '@factories/subscription.factory';
import { SubscriptionCommands } from '@modules/subscription/subscription.commands';
import * as Constants from '@modules/subscription/subscription.constants';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Source } from '@sources/core/source';
import { ChatInputCommandInteraction } from 'discord.js';

jest.mock(
  '@mikro-orm/core',
  (): Record<string, unknown> => ({
    ...jest.requireActual('@mikro-orm/core'),
    CreateRequestContext:
      () =>
      (
        _target: object,
        _key: string,
        descriptor: PropertyDescriptor,
      ): PropertyDescriptor =>
        descriptor,
  }),
);

describe(SubscriptionCommands.name, () => {
  const source = SourceId.WarhammerCommunity;
  const mockSource: Source = {
    id: source,
    label: 'Warhammer Community',
    description: 'The essential Warhammer news and features site',
    url: 'https://www.warhammer-community.com',
    toDiscordString: () =>
      '[`Warhammer Community`](https://www.warhammer-community.com)',
    toString: () => 'Warhammer Community',
  } as Source;
  const channelId = '111';

  let commands: SubscriptionCommands;
  let subscriptionService: jest.Mocked<SubscriptionService>;
  let interaction: {
    channelId: string;
    inGuild: jest.Mock;
    deferReply: jest.Mock;
    editReply: jest.Mock;
  };

  beforeEach(() => {
    Source.clearRegistry();
    Source.register(mockSource);

    subscriptionService = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      getChannelSubscriptions: jest.fn(),
      getSubscribedChannels: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionService>;

    interaction = {
      channelId,
      inGuild: jest.fn().mockReturnValue(true),
      deferReply: jest.fn().mockResolvedValue(undefined),
      editReply: jest.fn().mockResolvedValue(undefined),
    };

    commands = new SubscriptionCommands(subscriptionService, {} as never);
  });

  afterEach(() => {
    Source.clearRegistry();
    jest.restoreAllMocks();
  });

  describe('onSubscribe', () => {
    it('should subscribe and reply with success', async () => {
      subscriptionService.subscribe.mockResolvedValue(subscriptionFactory());

      await commands.onSubscribe(
        [interaction as unknown as ChatInputCommandInteraction],
        { sourceId: source },
      );

      expect(subscriptionService.subscribe).toHaveBeenCalledWith(
        mockSource,
        channelId,
      );
      expect(interaction.deferReply).toHaveBeenCalledWith({
        flags: ['Ephemeral'],
      });
      expect(interaction.editReply).toHaveBeenCalledWith({
        content: Constants.REPLIES.subscribeSuccess(channelId, mockSource),
      });
    });

    it('should reply with alreadySubscribed on ConflictException', async () => {
      subscriptionService.subscribe.mockRejectedValue(new ConflictException());

      await commands.onSubscribe(
        [interaction as unknown as ChatInputCommandInteraction],
        { sourceId: source },
      );

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: Constants.REPLIES.alreadySubscribed(channelId, mockSource),
      });
    });

    it('should reply with subscribeError on unknown error', async () => {
      subscriptionService.subscribe.mockRejectedValue(new Error('unknown'));

      await commands.onSubscribe(
        [interaction as unknown as ChatInputCommandInteraction],
        { sourceId: source },
      );

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: Constants.REPLIES.subscribeError(channelId, mockSource),
      });
    });
  });

  describe('onUnsubscribe', () => {
    it('should unsubscribe and reply with success', async () => {
      subscriptionService.unsubscribe.mockResolvedValue(undefined);

      await commands.onUnsubscribe(
        [interaction as unknown as ChatInputCommandInteraction],
        { sourceId: source },
      );

      expect(subscriptionService.unsubscribe).toHaveBeenCalledWith(
        mockSource,
        channelId,
      );
      expect(interaction.deferReply).toHaveBeenCalledWith({
        flags: ['Ephemeral'],
      });
      expect(interaction.editReply).toHaveBeenCalledWith({
        content: Constants.REPLIES.unsubscribeSuccess(channelId, mockSource),
      });
    });

    it('should reply with notSubscribed on NotFoundException', async () => {
      subscriptionService.unsubscribe.mockRejectedValue(
        new NotFoundException(),
      );

      await commands.onUnsubscribe(
        [interaction as unknown as ChatInputCommandInteraction],
        { sourceId: source },
      );

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: Constants.REPLIES.notSubscribed(channelId, mockSource),
      });
    });

    it('should reply with unsubscribeError on unknown error', async () => {
      subscriptionService.unsubscribe.mockRejectedValue(new Error('unknown'));

      await commands.onUnsubscribe(
        [interaction as unknown as ChatInputCommandInteraction],
        { sourceId: source },
      );

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: Constants.REPLIES.unsubscribeError(channelId, mockSource),
      });
    });
  });

  describe('onSubscriptions', () => {
    it('should reply with the subscriptions list', async () => {
      const subscriptions = [
        subscriptionFactory({
          sourceId: SourceId.WarhammerCommunity,
          channelId,
        }),
        subscriptionFactory({
          sourceId: SourceId.WarhammerCommunity,
          channelId,
        }),
      ];
      subscriptionService.getChannelSubscriptions.mockResolvedValue(
        subscriptions,
      );

      await commands.onSubscriptions([
        interaction as unknown as ChatInputCommandInteraction,
      ]);

      expect(subscriptionService.getChannelSubscriptions).toHaveBeenCalledWith(
        channelId,
      );
      expect(interaction.deferReply).toHaveBeenCalledWith({
        flags: ['Ephemeral'],
      });
      expect(interaction.editReply).toHaveBeenCalledWith({
        content: Constants.REPLIES.subscriptions(channelId, subscriptions),
      });
    });

    it('should reply with noSubscriptions when the list is empty', async () => {
      subscriptionService.getChannelSubscriptions.mockResolvedValue([]);

      await commands.onSubscriptions([
        interaction as unknown as ChatInputCommandInteraction,
      ]);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: Constants.REPLIES.noSubscriptions(channelId),
      });
    });

    it('should reply with subscriptionsError on error', async () => {
      subscriptionService.getChannelSubscriptions.mockRejectedValue(
        new Error('unknown'),
      );

      await commands.onSubscriptions([
        interaction as unknown as ChatInputCommandInteraction,
      ]);

      expect(interaction.editReply).toHaveBeenCalledWith({
        content: Constants.REPLIES.subscriptionsError(channelId),
      });
    });
  });
});
