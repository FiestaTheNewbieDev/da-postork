import { Migration } from '@mikro-orm/migrations';

export class Migration20260421071658 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "gundam_official_article" ("id" serial primary key, "published_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, "gundam_official_document_id" varchar(64) not null, "gundam_official_slug" varchar(255) null, "title" varchar(255) not null, "thumbnail_url" varchar(255) not null);`,
    );
    this.addSql(
      `alter table "gundam_official_article" add constraint "gundam_official_article_gundam_official_document_id_unique" unique ("gundam_official_document_id");`,
    );

    this.addSql(
      `alter table "codexygo_category" alter column "name" type varchar(64) using ("name"::varchar(64));`,
    );

    this.addSql(
      `alter table "codexygo_member" alter column "username" type varchar(64) using ("username"::varchar(64));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "gundam_official_article" cascade;`);

    this.addSql(
      `alter table "codexygo_category" alter column "name" type varchar(255) using ("name"::varchar(255));`,
    );

    this.addSql(
      `alter table "codexygo_member" alter column "username" type varchar(255) using ("username"::varchar(255));`,
    );
  }
}
