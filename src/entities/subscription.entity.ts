import { Entity, Enum, Opt, PrimaryKey, Property } from '@mikro-orm/core';

export enum SourceId {
  WarhammerCommunity = 'WARHAMMER_COMMUNITY',
  CodexYGO = 'CODEXYGO',
  GundamOfficial = 'GUNDAM_OFFICIAL',
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
  readonly source!: SourceId;

  @PrimaryKey({ name: 'channel_id', type: 'varchar(32)' })
  readonly channelId!: string;

  @Property({
    name: 'created_at',
    type: 'timestamp with time zone',
    nullable: false,
    defaultRaw: 'now()',
  })
  readonly createdAt: Opt<Date> = new Date();
}
