export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private currentLevel: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  debug(service: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, service, message, data);
  }

  info(service: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, service, message, data);
  }

  warn(service: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, service, message, data);
  }

  error(service: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, service, message, data, error);
  }

  private log(level: LogLevel, service: string, message: string, data?: any, error?: Error): void {
    if (level < this.currentLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      data,
      error,
    };
    this.logs.push(entry);

    // Manter apenas os últimos logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Output no console
    this.outputToConsole(entry);
  }

  private outputToConsole(entry: LogEntry): void {
    const levelNames = ["DEBUG", "INFO", "WARN", "ERROR"];
    const levelName = levelNames[entry.level];
    const message = `[${entry.timestamp}] [${levelName}] [${entry.service}] ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(message, entry.error || entry.data);
        break;
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((log) => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instância singleton
export const logger = new Logger();

