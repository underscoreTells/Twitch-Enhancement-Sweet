import { Logger } from "../src/backend/logger";

describe("Logger", () => {
	let logger: Logger;

	beforeEach(() => {
		logger = Logger.getInstance();
		logger.clearLogs(); // Ensure the logs are cleared before each test
	});

	test("should log a message", () => {
		logger.log("Test message");
		const logs = logger.getLogs();
		expect(logs.length).toBe(1);
		expect(logs[0]).toContain("Test message");
	});

	test("should log an error message", () => {
		logger.logError("Error message");
		const logs = logger.getLogs();
		expect(logs.length).toBe(1);
		expect(logs[0]).toContain("Error message");
	});

	test("should clear logs", () => {
		logger.log("Test message");
		logger.clearLogs();
		const logs = logger.getLogs();
		expect(logs.length).toBe(0);
	});

	test("should return the same instance", () => {
		const anotherLogger = Logger.getInstance();
		expect(logger).toBe(anotherLogger);
	});

	test("should log messages with a timestamp", () => {
		logger.log("Timestamped message");
		const logs = logger.getLogs();
		expect(logs[0]).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/); // Check if the log contains a valid ISO timestamp
		expect(logs[0]).toContain("Timestamped message");
	});
});
