export const fmt = {
  bold: (v) => `\x1b[1m${v}\x1b[0m`,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (v: any) => string>;
