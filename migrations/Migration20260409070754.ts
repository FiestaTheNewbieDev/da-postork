import { Migration } from '@mikro-orm/migrations';

export class Migration20260409070754 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "codexygo_article_categories" ("article_id" int not null, "category_id" int not null, "created_at" timestamptz not null default now(), constraint "codexygo_article_categories_pkey" primary key ("article_id", "category_id"));`,
    );

    this.addSql(
      `alter table "codexygo_article_categories" add constraint "codexygo_article_categories_article_id_foreign" foreign key ("article_id") references "codexygo_article" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "codexygo_article_categories" add constraint "codexygo_article_categories_category_id_foreign" foreign key ("category_id") references "codexygo_category" ("id") on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table "codexygo_article" drop constraint "codexygo_article_category_id_foreign";`,
    );

    this.addSql(`alter table "codexygo_article" drop column "category_id";`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "codexygo_article_categories" cascade;`);

    this.addSql(
      `alter table "codexygo_article" add column "category_id" int4 not null;`,
    );
    this.addSql(
      `alter table "codexygo_article" add constraint "codexygo_article_category_id_foreign" foreign key ("category_id") references "codexygo_category" ("id") on update cascade on delete no action;`,
    );
  }
}
