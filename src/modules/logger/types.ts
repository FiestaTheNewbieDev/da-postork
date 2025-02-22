import { Type } from '@nestjs/common';

export interface ILoggerConfig {
  moduleName: string;
  providers: Type<any>[];
}
