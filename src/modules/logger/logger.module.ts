import { createLoggerProvider } from '@modules/logger/logger.factory';
import { ILoggerConfig } from '@modules/logger/types';
import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class LoggerModule {
  static forRoot(config: ILoggerConfig): DynamicModule {
    const loggerProviders = config.providers.map((provider) => ({
      ...createLoggerProvider(config.moduleName, provider),
      // inject: [provider],
    }));

    return {
      module: LoggerModule,
      providers: loggerProviders,
      exports: loggerProviders,
    };
  }
}
