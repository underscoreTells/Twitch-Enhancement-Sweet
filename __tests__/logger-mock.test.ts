import { Logger } from "../src/backend/logger";

jest.mock("../src/logger", () => ({
	Logger: {
		getInstance: jest.fn().mockReturnValue({
			logError: jest.fn(),
		}),
	},
}));

test("Logger mock works", () => {
	const logger = Logger.getInstance();
	logger.logError("Test error");
	expect(logger.logError).toHaveBeenCalledWith("Test error");
});
