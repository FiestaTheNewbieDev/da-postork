import { Entity, Enum, Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { Source } from '@sources/core/source';

export enum SourceId {
  WarhammerCommunity = 'WARHAMMER_COMMUNITY',
  CodexYGO = 'CODEXYGO',
  GundamOfficial = 'GUNDAM_OFFICIAL',
  Marvel = 'MARVEL',
}

@Entity({
  tableName: 'subscription',
})
export class Subscription {
  @Enum({
    items: () => SourceId,
    nativeEnumName: 'subscription_source',
    primary: true,
    name: 'source',
  })
  readonly sourceId!: SourceId;

  @PrimaryKey({ name: 'channel_id', type: 'varchar(32)' })
  readonly channelId!: string;

  @Property({
    name: 'created_at',
    type: 'timestamp with time zone',
    nullable: false,
    defaultRaw: 'now()',
  })
  readonly createdAt: Opt<Date> = new Date();

  @Property({ persist: false })
  public get source(): Opt<Source> {
    return Source.resolve(this.sourceId);
  }
}
