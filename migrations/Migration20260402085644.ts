import { Migration } from '@mikro-orm/migrations';

export class Migration20260402085644 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "warhammer_community_article" ("id" serial primary key, "warhammer_community_id" varchar(64) not null, "warhammer_community_uuid" varchar(64) not null, "warhammer_community_slug" varchar(255) not null, "title" varchar(255) not null, "locale" varchar(8) not null, "thumbnail_path" varchar(255) null, "published_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null);`,
    );
    this.addSql(
      `alter table "warhammer_community_article" add constraint "warhammer_community_id_uuid_unique" unique ("warhammer_community_id", "warhammer_community_uuid");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "warhammer_community_article" cascade;`);
  }
}
