import { Migration } from '@mikro-orm/migrations';

export class Migration20260421072504 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter type "subscription_source" add value if not exists 'GUNDAM_OFFICIAL' after 'CODEXYGO';`,
    );
  }
}
