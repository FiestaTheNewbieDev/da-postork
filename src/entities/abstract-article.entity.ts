import { Opt, PrimaryKey, Property } from '@mikro-orm/core';

export abstract class AbstractArticle {
  @PrimaryKey({ name: 'id', type: 'integer', autoincrement: true })
  readonly id!: Opt<number>;

  @Property({ name: 'title', columnType: 'varchar(255)', nullable: false })
  title!: string;

  @Property({
    name: 'published_at',
    type: 'timestamp with time zone',
    nullable: false,
  })
  publishedAt!: Date;

  @Property({
    name: 'created_at',
    type: 'timestamp with time zone',
    nullable: false,
    defaultRaw: 'now()',
  })
  readonly createdAt: Opt<Date> = new Date();

  @Property({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: false,
    defaultRaw: 'now()',
    onUpdate: () => new Date(),
  })
  updatedAt: Opt<Date> = new Date();

  @Property({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt?: Date;
}
