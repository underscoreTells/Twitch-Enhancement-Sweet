import { OAuth2AuthService } from "../src/backend/oauth2-auth-service";
import { Logger } from "../src/backend/logger";
import { TokenError } from "../src/backend/errors";
import * as childProcess from "node:child_process";
import { mockServer } from "../src/mocks/mock-server";
import { nightbotAuthorizeURL, nightbotTokenURL } from "../src/utils/constants";

jest.mock("../src/backend/logger", () => {
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
	const authorizeUrl = nightbotAuthorizeURL;
	const redirectUri = "https://test-redirect-uri.com";
	const tokenUrl = nightbotTokenURL;
	let service: OAuth2AuthService;

	beforeAll(() => {
		mockServer.listen();
	});

	beforeEach(() => {
		service = new OAuth2AuthService(
			clientId,
			clientSecret,
			authorizeUrl,
			redirectUri,
			tokenUrl,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
		mockServer.resetHandlers();
	});

	afterAll(() => {
		mockServer.close();
	});

	test("should throw an error if no access token was previously received and if no token code is provided", async () => {
		await expect(service.getAccessToken()).rejects.toThrow(
			"No code was provided to fetch access token. Please provide code by authorizing with service",
		);
	});

	test("should call exchangeCodeForToken and return accessToken if code is provided to getAccessToken", async () => {
		const exchangeCode = jest.spyOn(service, "exchangeCodeForToken");
		// Mocking isTokenExpired to always return false
		jest.spyOn(service, "isTokenExpired").mockReturnValue(false);

		const token = await service.getAccessToken("valid_code");

		expect(exchangeCode).toHaveBeenCalled();
		expect(token).toBe("valid_access_token");
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		expect(service["accessToken"]).toBe("valid_access_token");
	});

	test("should refresh the access token if it has expired", async () => {
		// Set an initial access token
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		service["accessToken"] = "expired_token";
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		service["refreshToken"] = "expired_token";
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		service["tokenExpiresIn"] = -1;

		console.log(tokenUrl);

		// Call the method under test
		const token = await service.getAccessToken();

		// Assertions
		expect(token).toBe("valid_access_token");
	});

	test("should return the access token if it is still valid", async () => {
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		service["accessToken"] = "valid_access_token";

		jest.spyOn(service, "isTokenExpired").mockReturnValue(false);

		expect(await service.getAccessToken()).toBe("valid_access_token");
	});

	test("refreshAccessToken should throw if no refresh token was received from the API", async () => {
		await expect(service.refreshAccessToken()).rejects.toThrow(
			`No refresh token available for ${authorizeUrl}`,
		);
	});
});
