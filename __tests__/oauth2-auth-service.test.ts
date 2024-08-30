import { OAuth2AuthService } from "../src/oauth2-auth-service";
import { Logger } from "../src/logger";

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
	const tokenUrl = "https://test-token-url.com";
	const redirectUri = "https://test-redirect-uri.com";
	let service: OAuth2AuthService;

	beforeEach(() => {
		service = new OAuth2AuthService(
			clientId,
			clientSecret,
			tokenUrl,
			redirectUri,
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

	test("should return null access token initially", async () => {
		const token = await service.getAccessToken("test-scope");
		expect(token).toBeNull();
	});
});
