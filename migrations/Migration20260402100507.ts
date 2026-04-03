import { Migration } from '@mikro-orm/migrations';

export class Migration20260402100507 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "warhammer_community_article" add column "excerpt" varchar(512) null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "warhammer_community_article" drop column "excerpt";`,
    );
  }
}
