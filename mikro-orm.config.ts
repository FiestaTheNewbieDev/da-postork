import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';

interface DatabaseCredentials {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

function getDatabaseCredentials(): DatabaseCredentials {
  const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
  } = process.env;
  const missing = Object.entries({
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0)
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);

  return {
    host: POSTGRES_HOST!,
    port: POSTGRES_PORT ?? '5432',
    username: POSTGRES_USER!,
    password: POSTGRES_PASSWORD!,
    database: POSTGRES_DB!,
  };
}

function createConfig(): ReturnType<typeof defineConfig> {
  const { host, port, username, password, database } = getDatabaseCredentials();

  return {
    host,
    port: Number(port),
    user: username,
    password,
    dbName: database,
    entities: ['./dist/entities/**/*.js'],
    entitiesTs: ['./src/entities/**/*.ts'],
    extensions: [Migrator],
    migrations: {
      path: './dist/migrations',
      pathTs: './migrations',
      glob: '!(*.d).{js,ts}',
    },
  };
}

export default defineConfig(createConfig());
