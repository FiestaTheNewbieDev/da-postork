import { ConfigService } from '@modules/config/config.service';
import { ConfigService as NestConfigService } from '@nestjs/config';

describe(ConfigService.name, () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    jest
      .spyOn(NestConfigService.prototype, 'get')
      .mockReturnValue('mocked-value' as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call super.get with { infer: true }', () => {
    configService.get('DISCORD_BOT_TOKEN');
    expect(NestConfigService.prototype.get).toHaveBeenCalledWith(
      'DISCORD_BOT_TOKEN',
      { infer: true },
    );
  });

  it('should return the value from super.get', () => {
    expect(configService.get('DISCORD_BOT_TOKEN')).toBe('mocked-value');
  });
});
