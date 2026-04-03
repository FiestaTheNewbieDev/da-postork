import { ReadyListener } from '@modules/discord/listeners/ready.listener';
import { Module } from '@nestjs/common';

@Module({
  providers: [ReadyListener],
})
export class DiscordListenersModule {}
