import type { AuthServiceInterface } from "./auth-service-interface";
import { RefreshTokenError } from "./errors";
import { Logger } from "./logger";
import fetch, { Response } from "node-fetch";

export class OAuth2AuthService implements AuthServiceInterface {
	private clientId: string;
	private clientSecret: string;
	private tokenUrl: string;
	private authorizeUrl: string;
	private redirectUri: string;
	private accessToken: string | null;
	private refreshToken: string | null;
	private tokenExpiresIn: number | null;

	constructor(
		clientId: string,
		clientSecret: string,
		authorizeUrl: string,
		redirectUri: string,
	) {
		this.bind();

		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.authorizeUrl = authorizeUrl;
		this.redirectUri = redirectUri;

		this.tokenUrl = "";
		this.accessToken = null;
		this.refreshToken = null;
		this.tokenExpiresIn = null;
	}

	async getAccessToken(scope: string): Promise<string | null> {
		if (!this.accessToken || this.isTokenExpired()) {
			await this.refreshAccessToken(scope);
		}
		return this.accessToken;
	}

	async refreshAccessToken(scope: string): Promise<void> {
		console.log("refreshAccessToken called");
		const params = new URLSearchParams();
		params.append("client_id", this.clientId);
		params.append("client_secret", this.clientSecret);
		params.append("grant_type", "client_credentials");
		params.append("redirect_uri", this.redirectUri);
		params.append("scope", scope);

		let response = new Response();
		let tryCounter = 0;

		try {
			do {
				response = await fetch(this.tokenUrl, {
					method: "post",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: params,
				});

				if (!response.ok) tryCounter++;
			} while (tryCounter < 3);
		} catch (error) {
			Logger.getInstance().logError(
				`Authentication error for ${this.tokenUrl}: ${error}`,
			);
		}

		throw new RefreshTokenError(
			`response.ok = false when trying to refresh token with ${this.tokenUrl}. Tried to refresh ${tryCounter} times`,
			response,
		);
	}

	isTokenExpired(): boolean {
		return Date.now() >= (this.tokenExpiresIn ?? 0);
	}

	private bind(): void {
		this.getAccessToken = this.getAccessToken.bind(this);
		this.refreshAccessToken = this.refreshAccessToken.bind(this);
		this.isTokenExpired = this.isTokenExpired.bind(this);
	}
}
