import type { AuthServiceInterface } from "./auth-service-interface";
import { Logger } from "./logger";

export class OAuth2AuthService /*implements AuthServiceInterface*/ {
	private clientId: string;
	private clientSecret: string;
	private tokenUrl: string;
	private redirectUri: string;
	private accessToken: string | null;
	private refreshToken: string | null;
	private tokenExpiresIn: number | null;

	constructor(
		clientId: string,
		clientSecret: string,
		tokenUrl: string,
		redirectUri: string,
	) {
		this.bind();

		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.tokenUrl = tokenUrl;
		this.redirectUri = redirectUri;

		this.accessToken = null;
		this.refreshToken = null;
		this.tokenExpiresIn = null;
		console.log("constructor called");
	}

	async getAccessToken(scope: string): Promise<string | null> {
		console.log("getAccessToken called");
		if (!this.accessToken || this.isTokenExpired()) {
			await this.refreshAccessToken(scope);
			console.log("getAccessToken ifStatement called");
		}
		return this.accessToken;
	}

	async refreshAccessToken(scope: string): Promise<void> {
		const params = new URLSearchParams();
		params.append("client_id", this.clientId);
		params.append("client_secret", this.clientSecret);
		params.append("grant_type", "client_credentials");
		params.append("redirect_uri", this.redirectUri);
		params.append("scope", scope);

		try {
			const response = await fetch(this.tokenUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: params,
			});

			if (!response.ok) {
				throw new Error("Failed to refresh token");
			}

			const data = await response.json();
			this.accessToken = data.access_token;
			this.refreshToken = data.refresh_token;
			this.tokenExpiresIn = Date.now() + data.expires_in * 1000;
		} catch (error) {
			this.handleAuthError(error);
		}
	}

	isTokenExpired(): boolean {
		return Date.now() >= (this.tokenExpiresIn ?? 0);
	}

	private handleAuthError(error: unknown): void {
		const logger = Logger.getInstance();
		logger.logError("authentication error");
		process.exit(1);
	}

	private bind(): void {
		this.getAccessToken = this.getAccessToken.bind(this);
		this.refreshAccessToken = this.refreshAccessToken.bind(this);
		this.isTokenExpired = this.isTokenExpired.bind(this);
		this.handleAuthError = this.handleAuthError.bind(this);
	}
}
