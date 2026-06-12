import { CommandsModule } from '@modules/commands/commands.module';
import { CommandFactory } from 'nest-commander';

async function bootstrap() {
  await CommandFactory.run(CommandsModule, {
    logger: false,
  });
}

void bootstrap();
