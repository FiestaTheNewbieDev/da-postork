import { createLogger } from '@modules/logger/logger.factory';
import { DynamicModule, Module, Type } from '@nestjs/common';

@Module({})
export class LoggerModule {
  static forRoot(module: Type<any>, providers: Type<any>[]): DynamicModule {
    const loggerProviders = providers.map((provider) =>
      createLogger(module, provider),
    );

    return {
      module: LoggerModule,
      providers: [
        ...loggerProviders,
        {
          provide: 'LOGGER',
          useFactory: (target: Type<any>) => createLogger(module, target),
          inject: [...providers],
        },
      ],
      exports: ['LOGGER', ...providers],
    };
  }
}
