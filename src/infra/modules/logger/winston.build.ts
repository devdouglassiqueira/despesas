import * as winston from 'winston';

export class Winston {
  public readonly logger: winston.Logger;
  constructor() {
    this.logger = winston.createLogger({
      transports: new winston.transports.Console(),
    });
  }
}
