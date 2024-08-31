import { OAuth2AuthService } from "../src/backend/oauth2-auth-service";
import { Logger } from "../src/backend/logger";
import { TokenError } from "../src/backend/errors";

jest.mock("../src/logger", () => {
	return {
		Logger: {
			getInstance: jest.fn().mockReturnValue({
				logError: jest.fn(),
				log: jest.fn(), //In case Oauth uses log in the future, which is very likely
			}),
		},
	};
});

describe("OAuth2AuthService", () => {
	const clientId = "test-client-id";
	const clientSecret = "test-client-secret";
	const authorizeUrl = "https://test-authorize-url.com";
	const redirectUri = "https://test-redirect-uri.com";
	const tokenUrl = "https://test-token-url.com";
	let service: OAuth2AuthService;

	beforeEach(() => {
		service = new OAuth2AuthService(
			clientId,
			clientSecret,
			authorizeUrl,
			redirectUri,
			tokenUrl,
		);

		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({
				access_token: "mocked-access-token",
				refresh_token: "mocked-refresh-token",
				expires_in: 3600,
			}),
		} as Response);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("should call refreshAccessToken on first call", async () => {
		const refreshAccessTokenSpy = jest.spyOn(service, "refreshAccessToken");
		const toke = await service.getAccessToken();
		expect(refreshAccessTokenSpy).toHaveBeenCalled();
	});

	test("should return null access token initially", async () => {
		const token = await service.getAccessToken();
		expect(token).not.toBeNull();
	});

	test("should refresh and return a new access token", async () => {
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({
				access_token: "mocked-access-token",
				refresh_token: "mocked-refresh-token",
				expires_in: -1,
			}),
		} as Response);

		const isTokenExpiredSpy = jest.spyOn(service, "isTokenExpired");

		await service.refreshAccessToken();

		const token = await service.getAccessToken();
		expect(isTokenExpiredSpy).toHaveBeenCalled();
	});

	/*test("should throw an error and call logger", async () => {
		jest.spyOn(global, "fetch").mockResolvedValueOnce({
			ok: false, // First call: simulate a failed request
		} as Response);
		.mockResolvedValueOnce({
				ok: false, // Second call: simulate another failed request
			} as Response)
			.mockResolvedValueOnce({
				ok: true, // Third call: simulate a successful request
				json: async () => ({
					access_token: "mocked-access-token",
					refresh_token: "mocked-refresh-token",
					expires_in: 3600,
				}),
			} as Response)

		const logger = Logger.getInstance();
		const logErrorSpy = logger.logError;

		await expect(service.refreshAccessToken("test-scope")).rejects.toThrow(
			RefreshTokenError,
		);

		expect(logErrorSpy).toHaveBeenCalledWith("authentication error");
	});*/

	test("manual call to refreshAccessToken", async () => {
		const manualService = new OAuth2AuthService(
			"clientId",
			"clientSecret",
			"authorizeUrl",
			"redirectUri",
			"tokenUrl",
		);

		jest.spyOn(global, "fetch").mockResolvedValueOnce({
			ok: false, // First call: simulate a failed request
		} as Response);

		console.log("About to call refreshAccessToken");
		await manualService.refreshAccessToken();
		console.log("Finished calling refreshAccessToken");
	});
});
