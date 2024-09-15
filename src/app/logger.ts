export class Logger {
	private static instance: Logger;
	private logs: string[];

	private constructor() {
		this.log = this.log.bind(this);
		this.clearLogs = this.clearLogs.bind(this);
		this.getLogs = this.getLogs.bind(this);

		// Initialize the log storage
		this.logs = [];
	}

	public static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	log(message: string): void {
		const timestamp = this.logPreWork(message);
		console.log(`${timestamp}: ${message}`);
	}

	logError(message: string): void {
		const timestamp = this.logPreWork(message);
		console.error(`${timestamp}: ${message}`);
	}

	clearLogs(): void {
		this.logs = [];
	}

	getLogs(): string[] {
		return this.logs;
	}

	private logPreWork(message: string): string {
		const timestamp = new Date().toISOString();
		this.logs.push(`${timestamp}: ${message}`);

		return timestamp;
	}
}
