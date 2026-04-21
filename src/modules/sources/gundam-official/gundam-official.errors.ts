import { ZodError } from 'zod';

export class ScriptNotFoundError extends Error {
  constructor() {
    super('News script tag not found in page');
    this.name = 'ScriptNotFoundError';
  }
}

export class PayloadExtractionError extends Error {
  constructor() {
    super('Failed to extract __next_f payload from script');
    this.name = 'PayloadExtractionError';
  }
}

export class JsonParseError extends Error {
  constructor(cause: unknown) {
    super('Failed to parse JSON payload');
    this.name = 'JsonParseError';
    this.cause = cause;
  }
}

export class SchemaValidationError extends Error {
  constructor(public readonly cause: ZodError) {
    super('Payload does not match expected schema');
    this.name = 'SchemaValidationError';
    this.cause = cause;
  }
}
