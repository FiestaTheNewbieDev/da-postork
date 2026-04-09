import { CodexYGOArticle } from '@entities/codexygo';
import { MikroORM } from '@mikro-orm/core';
import { Processor } from '@nestjs/bullmq';
import { AbstractSourceConsumer } from '@sources/abstract-source.consumer';
import * as Constants from '@sources/codexygo/codexygo.constants';
import { CodexYGOService } from '@sources/codexygo/codexygo.service';
import { Client } from 'discord.js';

@Processor(Constants.CODEXYGO_QUEUE, {
  concurrency: 4,
})
export class CodexYGOConsumer extends AbstractSourceConsumer<CodexYGOArticle> {
  constructor(orm: MikroORM, client: Client, codexygoService: CodexYGOService) {
    super(orm, client, codexygoService);
  }
}
