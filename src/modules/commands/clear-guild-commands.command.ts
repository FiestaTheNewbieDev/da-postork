import { ConfigService } from '@modules/config/config.service';
import { REST, Routes } from 'discord.js';
import { Command, CommandRunner } from 'nest-commander';

interface OAuth2Application {
  id: string;
}

@Command({
  name: 'clear-guild-commands',
  arguments: '<guildId>',
  argsDescription: {
    guildId: 'The ID of the guild whose commands should be cleared.',
  },
  description: 'Clear all application commands registered for a guild.',
})
export class ClearGuildCommandsCommand extends CommandRunner {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async run([guildId]: string[]): Promise<void> {
    const token = this.configService.get('DISCORD_BOT_TOKEN');

    const rest = new REST().setToken(token);

    const app = (await rest.get(
      Routes.oauth2CurrentApplication(),
    )) as OAuth2Application;

    console.log(`Clearing commands for guild ${guildId}...`);
    await rest.put(Routes.applicationGuildCommands(app.id, guildId), {
      body: [],
    });
    console.log('Done.');
  }
}
