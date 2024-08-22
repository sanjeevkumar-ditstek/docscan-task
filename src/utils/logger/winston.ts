import winston from 'winston';
const { combine, timestamp, printf, colorize, align, metadata } =
  winston.format;
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
  format: combine(
    colorize({ all: true }),
    metadata(),
    timestamp(),
    printf(({ timestamp, level, message, metadata }) => {
      return `[${timestamp}] ${level}: ${message} :${JSON.stringify(metadata)}`;
    })
  )
};
const logger = winston.createLogger(logConfiguration);
logger.info('Starting logging service');
export default logger;
