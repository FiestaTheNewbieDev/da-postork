import { Migration } from '@mikro-orm/migrations';

export class Migration20260424081223 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create type "marvel_article_category" as enum ('MOVIES', 'COMICS', 'TV_SHOWS', 'GAMES', 'DIGITAL_SERIES', 'CULTURE_AND_LIFESTYLE', 'PODCAST');`,
    );
    this.addSql(
      `create table "marvel_article" ("id" serial primary key, "title" varchar(255) not null, "published_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, "marvel_link" varchar(255) not null, "description" varchar(1024) null, "category" "marvel_article_category" not null, "thumbnail_filename" varchar(255) null);`,
    );
    this.addSql(
      `alter table "marvel_article" add constraint "marvel_article_marvel_link_unique" unique ("marvel_link");`,
    );

    this.addSql(
      `alter type "subscription_source" add value if not exists 'MARVEL' after 'GUNDAM_OFFICIAL';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "marvel_article" cascade;`);

    this.addSql(`drop type "marvel_article_category";`);
  }
}
