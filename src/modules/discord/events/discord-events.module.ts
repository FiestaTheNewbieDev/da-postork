import { ReadyEvent } from '@modules/discord/events/ready.event';
import { Module } from '@nestjs/common';

@Module({
  providers: [ReadyEvent],
})
export class DiscordEventsModule {}
