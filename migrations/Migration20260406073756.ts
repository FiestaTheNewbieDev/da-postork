import { Migration } from '@mikro-orm/migrations';

export class Migration20260406073756 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create type "subscription_source" as enum ('WARHAMMER_COMMUNITY', 'CODEXYGO');`,
    );
    this.addSql(
      `create table "codexygo_article" ("id" serial primary key, "published_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, "title" varchar(255) not null);`,
    );

    this.addSql(
      `create table "subscription" ("source" "subscription_source" not null, "channel_id" varchar(255) not null, "created_at" timestamptz not null default now(), constraint "subscription_pkey" primary key ("source", "channel_id"));`,
    );

    this.addSql(
      `create table "warhammer_community_article" ("id" serial primary key, "published_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, "warhammer_community_id" varchar(64) not null, "warhammer_community_uuid" varchar(64) not null, "warhammer_community_slug" varchar(255) not null, "title" varchar(255) not null, "excerpt" varchar(512) null, "locale" varchar(8) not null, "thumbnail_path" varchar(255) null);`,
    );
    this.addSql(
      `alter table "warhammer_community_article" add constraint "warhammer_community_id_uuid_unique" unique ("warhammer_community_id", "warhammer_community_uuid");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "codexygo_article" cascade;`);

    this.addSql(`drop table if exists "subscription" cascade;`);

    this.addSql(`drop table if exists "warhammer_community_article" cascade;`);

    this.addSql(`drop type "subscription_source";`);
  }
}
