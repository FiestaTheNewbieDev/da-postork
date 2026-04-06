import * as Constants from '@modules/discord/discord.constants';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { NecordExecutionContext } from 'necord';

@Injectable()
export class ManageChannelsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = NecordExecutionContext.create(context);
    const [interaction] = ctx.getContext<[ChatInputCommandInteraction]>();

    if (!interaction.memberPermissions) {
      void interaction.reply({
        content: Constants.REPLIES.missingPermissions('Manage Channels'),
        ephemeral: true,
      });
      return false;
    }

    return interaction.memberPermissions.has(
      PermissionsBitField.Flags.ManageChannels,
    );
  }
}
