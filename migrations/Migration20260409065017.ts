import { Migration } from '@mikro-orm/migrations';

export class Migration20260409065017 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "codexygo_category" ("id" serial primary key, "codexygo_oid" int not null, "name" varchar(255) not null, "path" varchar(255) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null);`,
    );
    this.addSql(
      `alter table "codexygo_category" add constraint "codexygo_category_codexygo_oid_unique" unique ("codexygo_oid");`,
    );

    this.addSql(
      `create table "codexygo_member" ("id" serial primary key, "codexygo_oid" int not null, "username" varchar(255) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null);`,
    );
    this.addSql(
      `alter table "codexygo_member" add constraint "codexygo_member_codexygo_oid_unique" unique ("codexygo_oid");`,
    );

    this.addSql(
      `alter table "codexygo_article" add column "codexygo_oid" int not null, add column "codexygo_slug" varchar(255) not null, add column "teaser" varchar(512) null, add column "tags" jsonb not null, add column "category_id" int not null, add column "creator_id" int not null;`,
    );
    this.addSql(
      `alter table "codexygo_article" add constraint "codexygo_article_category_id_foreign" foreign key ("category_id") references "codexygo_category" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "codexygo_article" add constraint "codexygo_article_creator_id_foreign" foreign key ("creator_id") references "codexygo_member" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "codexygo_article" add constraint "codexygo_article_codexygo_oid_unique" unique ("codexygo_oid");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "codexygo_article" drop constraint "codexygo_article_category_id_foreign";`,
    );

    this.addSql(
      `alter table "codexygo_article" drop constraint "codexygo_article_creator_id_foreign";`,
    );

    this.addSql(`drop table if exists "codexygo_category" cascade;`);

    this.addSql(`drop table if exists "codexygo_member" cascade;`);

    this.addSql(
      `alter table "codexygo_article" drop constraint "codexygo_article_codexygo_oid_unique";`,
    );
    this.addSql(
      `alter table "codexygo_article" drop column "codexygo_oid", drop column "codexygo_slug", drop column "teaser", drop column "tags", drop column "category_id", drop column "creator_id";`,
    );
  }
}
