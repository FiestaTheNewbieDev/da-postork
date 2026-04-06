import {
  Subscription,
  SubscriptionSource,
} from '@entities/subscription.entity';
import { SubscriptionCommands } from '@modules/subscription/subscription.commands';
import * as Constants from '@modules/subscription/subscription.constants';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ChatInputCommandInteraction } from 'discord.js';

describe(SubscriptionCommands.name, () => {
  const source = SubscriptionSource.WarhammerCommunity;
  const channelId = '111';

  let commands: SubscriptionCommands;
  let subscriptionService: jest.Mocked<SubscriptionService>;
  let interaction: { channelId: string; reply: jest.Mock };

  beforeEach(() => {
    subscriptionService = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      getChannelSubscriptions: jest.fn(),
      getSubscribedChannels: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionService>;

    interaction = {
      channelId,
      reply: jest.fn().mockResolvedValue(undefined),
    };

    commands = new SubscriptionCommands(subscriptionService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('onSubscribe', () => {
    it('should subscribe and reply with success', async () => {
      subscriptionService.subscribe.mockResolvedValue({} as Subscription);

      await commands.onSubscribe(
        [interaction as unknown as ChatInputCommandInteraction],
        {
          source,
        },
      );

      expect(subscriptionService.subscribe).toHaveBeenCalledWith(
        source,
        channelId,
      );
      expect(interaction.reply).toHaveBeenCalledWith({
        content: Constants.REPLIES.subscribeSuccess(channelId, source),
        ephemeral: true,
      });
    });

    it('should reply with alreadySubscribed and re-throw on ConflictException', async () => {
      subscriptionService.subscribe.mockRejectedValue(new ConflictException());

      await expect(
        commands.onSubscribe(
          [interaction as unknown as ChatInputCommandInteraction],
          {
            source,
          },
        ),
      ).rejects.toThrow(Error);

      expect(interaction.reply).toHaveBeenCalledWith({
        content: Constants.REPLIES.alreadySubscribed(channelId, source),
        ephemeral: true,
      });
    });

    it('should reply with subscribeError and re-throw on unknown error', async () => {
      subscriptionService.subscribe.mockRejectedValue(new Error('unknown'));

      await expect(
        commands.onSubscribe(
          [interaction as unknown as ChatInputCommandInteraction],
          {
            source,
          },
        ),
      ).rejects.toThrow(Error);

      expect(interaction.reply).toHaveBeenCalledWith({
        content: Constants.REPLIES.subscribeError(channelId, source),
        ephemeral: true,
      });
    });
  });

  describe('onUnsubscribe', () => {
    it('should unsubscribe and reply with success', async () => {
      subscriptionService.unsubscribe.mockResolvedValue(undefined);

      await commands.onUnsubscribe(
        [interaction as unknown as ChatInputCommandInteraction],
        { source },
      );

      expect(subscriptionService.unsubscribe).toHaveBeenCalledWith(
        source,
        channelId,
      );
      expect(interaction.reply).toHaveBeenCalledWith({
        content: Constants.REPLIES.unsubscribeSuccess(channelId, source),
        ephemeral: true,
      });
    });

    it('should reply with notSubscribed and re-throw on NotFoundException', async () => {
      subscriptionService.unsubscribe.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        commands.onUnsubscribe(
          [interaction as unknown as ChatInputCommandInteraction],
          {
            source,
          },
        ),
      ).rejects.toThrow(Error);

      expect(interaction.reply).toHaveBeenCalledWith({
        content: Constants.REPLIES.notSubscribed(channelId, source),
        ephemeral: true,
      });
    });

    it('should reply with unsubscribeError and re-throw on unknown error', async () => {
      subscriptionService.unsubscribe.mockRejectedValue(new Error('unknown'));

      await expect(
        commands.onUnsubscribe(
          [interaction as unknown as ChatInputCommandInteraction],
          {
            source,
          },
        ),
      ).rejects.toThrow(Error);

      expect(interaction.reply).toHaveBeenCalledWith({
        content: Constants.REPLIES.unsubscribeError(channelId, source),
        ephemeral: true,
      });
    });
  });

  describe('onSubscriptions', () => {
    it('should reply with the subscriptions list', async () => {
      const subscriptions = [
        { source: SubscriptionSource.WarhammerCommunity, channelId },
        { source: SubscriptionSource.CodexYGO, channelId },
      ] as Subscription[];
      subscriptionService.getChannelSubscriptions.mockResolvedValue(
        subscriptions,
      );

      await commands.onSubscriptions([
        interaction as unknown as ChatInputCommandInteraction,
      ]);

      expect(subscriptionService.getChannelSubscriptions).toHaveBeenCalledWith(
        channelId,
      );
      expect(interaction.reply).toHaveBeenCalledWith({
        content: Constants.REPLIES.subscriptions(channelId, subscriptions),
        ephemeral: true,
      });
    });

    it('should reply with noSubscriptions when the list is empty', async () => {
      subscriptionService.getChannelSubscriptions.mockResolvedValue([]);

      await commands.onSubscriptions([
        interaction as unknown as ChatInputCommandInteraction,
      ]);

      expect(interaction.reply).toHaveBeenCalledWith({
        content: Constants.REPLIES.noSubscriptions(channelId),
        ephemeral: true,
      });
    });

    it('should reply with subscriptionsError and re-throw on error', async () => {
      subscriptionService.getChannelSubscriptions.mockRejectedValue(
        new Error('unknown'),
      );

      await expect(
        commands.onSubscriptions([
          interaction as unknown as ChatInputCommandInteraction,
        ]),
      ).rejects.toThrow(Error);

      expect(interaction.reply).toHaveBeenCalledWith({
        content: Constants.REPLIES.subscriptionsError(channelId),
        ephemeral: true,
      });
    });
  });
});
