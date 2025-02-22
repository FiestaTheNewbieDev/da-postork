import { Logger, Type } from '@nestjs/common';

export function createLoggerProvider(moduleName: string, target: Type<any>) {
  const token = `${target.name.toUpperCase()}_LOGGER`;
  const context = `${moduleName}: ${target.name}`;

  return {
    provide: token,
    useFactory: () => new Logger(context),
  };
}
