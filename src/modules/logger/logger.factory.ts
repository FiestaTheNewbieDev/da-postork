import { Logger, Type } from '@nestjs/common';

export function createLogger(module: Type<any>, target: Type<any>) {
  const providerName = target.name;
  const context = `${module.name}: ${target.name}`;

  return {
    provide: providerName,
    useFactory: () => new Logger(context),
  };
}
