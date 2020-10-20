
export interface Logger {
  silly(arg: any): void;
  debug(arg: any): void;
  verbose(arg: any): void;
  info(arg: any): void;
  warn(arg: any): void;
  error(arg: any): void;
  log(arg: {
    level: 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error';
    message: any;
  }): void;
}

