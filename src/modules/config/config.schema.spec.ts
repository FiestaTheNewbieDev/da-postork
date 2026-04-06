import { configSchema } from '@modules/config/config.schema';

const validConfig = {
  DISCORD_BOT_TOKEN: 'test-token',
  POSTGRES_HOST: 'localhost',
  POSTGRES_USER: 'user',
  POSTGRES_PASSWORD: 'password',
  POSTGRES_DB: 'db',
  REDIS_HOST: 'localhost',
};

describe('configSchema', () => {
  it('should accept a valid configuration', () => {
    expect(configSchema.safeParse(validConfig).success).toBe(true);
  });

  it('should default NODE_ENV to "development"', () => {
    const result = configSchema.safeParse(validConfig);
    expect(result.success && result.data.NODE_ENV).toBe('development');
  });

  it('should default POSTGRES_PORT to 5432', () => {
    const result = configSchema.safeParse(validConfig);
    expect(result.success && result.data.POSTGRES_PORT).toBe(5432);
  });

  it('should default REDIS_PORT to 6379', () => {
    const result = configSchema.safeParse(validConfig);
    expect(result.success && result.data.REDIS_PORT).toBe(6379);
  });

  it('should coerce POSTGRES_PORT from string to number', () => {
    const result = configSchema.safeParse({
      ...validConfig,
      POSTGRES_PORT: '5433',
    });
    expect(result.success && result.data.POSTGRES_PORT).toBe(5433);
  });

  it('should coerce REDIS_PORT from string to number', () => {
    const result = configSchema.safeParse({
      ...validConfig,
      REDIS_PORT: '6380',
    });
    expect(result.success && result.data.REDIS_PORT).toBe(6380);
  });

  it('should allow DEV_GUILD_ID to be undefined', () => {
    const result = configSchema.safeParse(validConfig);
    expect(result.success && result.data.DEV_GUILD_ID).toBeUndefined();
  });

  it.each([
    'DISCORD_BOT_TOKEN',
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'REDIS_HOST',
  ])('should reject config missing %s', (field) => {
    const rest = Object.fromEntries(
      Object.entries(validConfig).filter(([k]) => k !== field),
    );
    expect(configSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject an invalid NODE_ENV value', () => {
    expect(
      configSchema.safeParse({ ...validConfig, NODE_ENV: 'test' }).success,
    ).toBe(false);
  });
});
