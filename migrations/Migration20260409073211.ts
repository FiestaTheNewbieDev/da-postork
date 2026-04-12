import { Migration } from '@mikro-orm/migrations';

export class Migration20260409073211 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "codexygo_article" add column "thumbnail_id" int null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "codexygo_article" drop column "thumbnail_id";`);
  }
}
