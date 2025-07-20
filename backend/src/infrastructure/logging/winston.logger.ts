import { createLogger, transports, format, Logger } from 'winston';
import { configDotenv } from 'dotenv';
import LokiTransport from 'winston-loki';
import 'winston-daily-rotate-file';

configDotenv();

const baseFormat = format.combine(
  format.timestamp(),
  format.printf(
    ({
      timestamp,
      level,
      message,
      errors,
    }: {
      timestamp: string;
      level: string;
      message: string;
      errors?: unknown;
    }) =>
      `${timestamp} [${level}]: ${message} ${errors ? JSON.stringify(errors, null, 2) : ''}`,
  ),
);

export function createLocalLogger(): Logger {
  return createLogger({
    level: 'debug',
    transports: [
      new transports.Console({ format: baseFormat }),
      new transports.DailyRotateFile({
        filename: 'logs/%DATE%-error.log',
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: baseFormat,
      }),
      new transports.DailyRotateFile({
        filename: 'logs/%DATE%-sucess.log',
        level: 'info',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: baseFormat,
      }),
    ],
  });
}

export function createProductionLogger(): Logger {
  if (!process.env.LOKI_HOST) {
    throw new Error('LOKI_HOST environment variable is not defined');
  }

  return createLogger({
    level: 'info',
    transports: [
      new transports.Console({ format: baseFormat }),

      new LokiTransport({
        host: process.env.LOKI_HOST,
        ...(process.env?.LOKI_USER &&
          process.env?.API_KEY && {
            basicAuth: `${process.env.LOKI_USER}:${process.env.API_KEY}`,
          }),
        labels: { app: 'kanban-api', env: 'production' },
        json: true,
        format: baseFormat,
        replaceTimestamp: true,
        onConnectionError: (err: unknown) => {
          if (err instanceof Error) {
            console.error('Error connecting to Loki', err.message);
          } else {
            console.error(
              'Unknown error connecting to Loki:',
              JSON.stringify(err),
            );
          }
        },
      }),
    ],
  });
}

const isProd = process.env.NODE_ENV === 'production';

export const logger = isProd ? createProductionLogger() : createLocalLogger();
