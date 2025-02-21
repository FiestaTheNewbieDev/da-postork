import { Inject } from '@nestjs/common';

export function InjectLogger(): ParameterDecorator {
  return Inject('LOGGER');
}
