import winston from 'winston';
import chalk from 'chalk';

// Custom format for console output with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    const coloredLevel = {
      error: chalk.red('ERROR'),
      warn: chalk.yellow('WARN'),
      info: chalk.blue('INFO'),
      debug: chalk.gray('DEBUG'),
    }[level] || level;

    const coloredTimestamp = chalk.gray(`[${timestamp}]`);
    const formattedMessage = stack ? `${message}\n${stack}` : message;
    
    return `${coloredTimestamp} ${coloredLevel}: ${formattedMessage}`;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'beauty-flow-backend' },
  transports: [
    // Console transport with colors for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? winston.format.json() 
        : consoleFormat
    }),
    
    // File transport for errors
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // File transport for all logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
});

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const logsDir = join(__dirname, '../../logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// If we're not in production, log to the console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

export default logger;
