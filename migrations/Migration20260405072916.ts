import { Migration } from '@mikro-orm/migrations';

export class Migration20260405072916 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create type "subscription_source" as enum ('WARHAMMER_COMMUNITY', 'CODEX_YGO');`,
    );
    this.addSql(
      `create table "subscription" ("source" "subscription_source" not null, "channel_id" varchar(255) not null, "created_at" timestamptz not null default now(), constraint "subscription_pkey" primary key ("source", "channel_id"));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "subscription" cascade;`);

    this.addSql(`drop type "subscription_source";`);
  }
}
