import { SubscriptionSource } from '@entities/subscription.entity';
import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { ManageChannelsGuard } from '@modules/discord/guards/manage-channels.guard';
import * as Constants from '@modules/subscription/subscription.constants';
import { SubscriptionService } from '@modules/subscription/subscription.service';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ChatInputCommandInteraction } from 'discord.js';
import { Context, Options, SlashCommand, StringOption } from 'necord';

class SourceDto {
  @StringOption({
    name: 'source',
    description: 'Notification source to subscribe to',
    required: true,
    choices: Object.values(Constants.SOURCES_MAP).map((s) => ({
      name: s.label,
      value: s.value,
    })),
  })
  source!: SubscriptionSource;
}

@Injectable()
export class SubscriptionCommands {
  private readonly logger = new Logger(SubscriptionCommands.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    protected readonly orm: MikroORM,
  ) {}

  @UseGuards(ManageChannelsGuard)
  @SlashCommand({
    name: 'subscribe',
    description: 'Subscribe this channel to a source',
  })
  async onSubscribe(
    @Context() [interaction]: [ChatInputCommandInteraction],
    @Options() { source }: SourceDto,
  ) {
    return this.handleSubscribe(interaction, source);
  }

  @CreateRequestContext()
  private async handleSubscribe(
    interaction: ChatInputCommandInteraction,
    source: SubscriptionSource,
  ) {
    try {
      await this.subscriptionService.subscribe(source, interaction.channelId);
      await interaction.reply({
        content: Constants.REPLIES.subscribeSuccess(
          interaction.channelId,
          source,
        ),
        ephemeral: true,
      });
    } catch (error) {
      if (error instanceof ConflictException)
        await interaction.reply({
          content: Constants.REPLIES.alreadySubscribed(
            interaction.channelId,
            source,
          ),
          ephemeral: true,
        });
      else {
        await interaction.reply({
          content: Constants.REPLIES.subscribeError(
            interaction.channelId,
            source,
          ),
          ephemeral: true,
        });
        this.logger.error(
          Constants.ERROR_MESSAGES.subscribeError(
            interaction.channelId,
            source,
          ),
          error,
        );
      }
    }
  }

  @UseGuards(ManageChannelsGuard)
  @SlashCommand({
    name: 'unsubscribe',
    description: 'Unsubscribe this channel from a source',
  })
  async onUnsubscribe(
    @Context() [interaction]: [ChatInputCommandInteraction],
    @Options() { source }: SourceDto,
  ) {
    return this.handleUnsubscribe(interaction, source);
  }

  @CreateRequestContext()
  private async handleUnsubscribe(
    interaction: ChatInputCommandInteraction,
    source: SubscriptionSource,
  ) {
    try {
      await this.subscriptionService.unsubscribe(source, interaction.channelId);
      await interaction.reply({
        content: Constants.REPLIES.unsubscribeSuccess(
          interaction.channelId,
          source,
        ),
        ephemeral: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException)
        await interaction.reply({
          content: Constants.REPLIES.notSubscribed(
            interaction.channelId,
            source,
          ),
          ephemeral: true,
        });
      else {
        await interaction.reply({
          content: Constants.REPLIES.unsubscribeError(
            interaction.channelId,
            source,
          ),
          ephemeral: true,
        });
        this.logger.error(
          Constants.ERROR_MESSAGES.unsubscribeError(
            interaction.channelId,
            source,
          ),
          error,
        );
      }
    }
  }

  @SlashCommand({
    name: 'subscriptions',
    description: 'List this channel subscriptions',
  })
  async onSubscriptions(
    @Context() [interaction]: [ChatInputCommandInteraction],
  ) {
    return this.handleSubscriptions(interaction);
  }

  @CreateRequestContext()
  private async handleSubscriptions(interaction: ChatInputCommandInteraction) {
    try {
      const subscriptions =
        await this.subscriptionService.getChannelSubscriptions(
          interaction.channelId,
        );

      if (subscriptions.length === 0) {
        await interaction.reply({
          content: Constants.REPLIES.noSubscriptions(interaction.channelId),
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        content: Constants.REPLIES.subscriptions(
          interaction.channelId,
          subscriptions,
        ),
        ephemeral: true,
      });
    } catch (error) {
      await interaction.reply({
        content: Constants.REPLIES.subscriptionsError(interaction.channelId),
        ephemeral: true,
      });
      this.logger.error(
        Constants.ERROR_MESSAGES.subscriptionsError(interaction.channelId),
        error,
      );
    }
  }
}
