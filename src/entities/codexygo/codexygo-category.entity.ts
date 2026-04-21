import { Entity, Filter, Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
  tableName: 'codexygo_category',
})
@Filter({
  name: 'notDeleted',
  cond: { deletedAt: null },
  default: true,
})
export class CodexYGOCategory {
  @PrimaryKey({ name: 'id', type: 'integer', autoincrement: true })
  readonly id!: Opt<number>;

  @Property({
    name: 'codexygo_oid',
    type: 'integer',
    nullable: false,
    unique: true,
  })
  readonly codexygoOid!: number;

  @Property({ name: 'name', columnType: 'varchar(64)', nullable: false })
  name!: string;

  @Property({ name: 'path', columnType: 'varchar(255)', nullable: false })
  path!: string;

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
