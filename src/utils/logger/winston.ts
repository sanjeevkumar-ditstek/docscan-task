import winston from "winston";

export async function loggerStart() {
  try {
    const logConfiguration = {
      transports: [
        new winston.transports.Console({
          level: 'warn' || 'info'
        }),
        new winston.transports.Console({
          level: 'info'
        }),
        new winston.transports.File({
          level: 'error',
          filename: 'logs/error.log'
        })
      ],
      format: winston.format.combine(
        winston.format.metadata(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, metadata }) => {
          return `[${timestamp}] ${level}: ${message} :${JSON.stringify(metadata)}`;
        })
      )
    }
    const logger = winston.createLogger(logConfiguration);
    logger.info('Starting logging service');

  } catch (error) {
    console.error(error);
  }
}

