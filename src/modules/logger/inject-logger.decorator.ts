import { Inject, Type } from '@nestjs/common';

export const LOGGER_TOKEN = 'CUSTOM_LOGGER';

export function InjectLogger(): ParameterDecorator {
  return (
    target: Type<any>,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const className = target.name;
    Inject(`${className.toUpperCase()}__LOGGER`)(
      target,
      propertyKey,
      parameterIndex,
    );
  };
}
