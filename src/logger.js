export class Logger {
    constructor() {
        if (Logger.instance) {
            return Logger.instance;
        }
        Logger.instance = this;

        // Initialize the log storage
        this.logs = [];
    }

    log(message) {
        const timestamp = new Date().toISOString();
        this.logs.push(`${timestamp}: ${message}`);
        console.log(`${timestamp}: ${message}`);
    }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
    }
}