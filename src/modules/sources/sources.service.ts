import { SourceId } from '@entities/subscription.entity';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Source } from '@sources/core/abstract-source';
import { SOURCES } from '@sources/sources.constants';

@Injectable()
export class SourcesService {
  constructor(@Inject(SOURCES) private readonly sources: Source[]) {}

  public getAll(): Source[] {
    return this.sources;
  }

  public resolve(sourceId: SourceId): Source {
    const source = this.sources.find((s) => s.id === sourceId);
    if (!source) throw new NotFoundException(`Unknown source: ${sourceId}`);
    return source;
  }
}
