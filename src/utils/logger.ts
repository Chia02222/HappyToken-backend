/**
 * Centralized logging utility
 * Replaces console statements with proper logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  component?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const currentLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
    return level >= currentLevel;
  }

  private addLog(level: LogLevel, message: string, context?: Record<string, any>, component?: string): void {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      component,
    };

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    if (process.env.NODE_ENV === 'development') {
      const timestamp = logEntry.timestamp.toISOString();
      const componentStr = component ? `[${component}]` : '';
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`${timestamp} ${componentStr} ${message}${contextStr}`);
          break;
        case LogLevel.INFO:
          console.info(`${timestamp} ${componentStr} ${message}${contextStr}`);
          break;
        case LogLevel.WARN:
          console.warn(`${timestamp} ${componentStr} ${message}${contextStr}`);
          break;
        case LogLevel.ERROR:
          console.error(`${timestamp} ${componentStr} ${message}${contextStr}`);
          break;
      }
    }
  }

  debug(message: string, context?: Record<string, any>, component?: string): void {
    this.addLog(LogLevel.DEBUG, message, context, component);
  }

  info(message: string, context?: Record<string, any>, component?: string): void {
    this.addLog(LogLevel.INFO, message, context, component);
  }

  warn(message: string, context?: Record<string, any>, component?: string): void {
    this.addLog(LogLevel.WARN, message, context, component);
  }

  error(message: string, context?: Record<string, any>, component?: string): void {
    this.addLog(LogLevel.ERROR, message, context, component);
  }

  getLogs(level?: LogLevel, component?: string): LogEntry[] {
    return this.logs.filter(log => {
      if (level !== undefined && log.level !== level) return false;
      if (component && log.component !== component) return false;
      return true;
    });
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();

export const logDebug = (message: string, context?: Record<string, any>, component?: string) => {
  logger.debug(message, context, component);
};

export const logInfo = (message: string, context?: Record<string, any>, component?: string) => {
  logger.info(message, context, component);
};

export const logWarn = (message: string, context?: Record<string, any>, component?: string) => {
  logger.warn(message, context, component);
};

export const logError = (message: string, context?: Record<string, any>, component?: string) => {
  logger.error(message, context, component);
};
