import { ClearGuildCommandsCommand } from '@modules/commands/clear-guild-commands.command';
import { ConfigModule } from '@modules/config/config.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule],
  providers: [ClearGuildCommandsCommand],
})
export class CommandsModule {}
