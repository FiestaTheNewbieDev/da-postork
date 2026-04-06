import { Entity, Enum, Opt, PrimaryKey, Property } from '@mikro-orm/core';

export enum SubscriptionSource {
  WarhammerCommunity = 'WARHAMMER_COMMUNITY',
  CodexYGO = 'CODEXYGO',
}

@Entity({
  tableName: 'subscription',
})
export class Subscription {
  @Enum({
    items: () => SubscriptionSource,
    nativeEnumName: 'subscription_source',
    primary: true,
    name: 'source',
  })
  readonly source!: SubscriptionSource;

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
