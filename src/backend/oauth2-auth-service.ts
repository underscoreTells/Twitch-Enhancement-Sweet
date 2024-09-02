import type { AuthServiceInterface } from "./auth-service-interface";
import { TokenError } from "./errors";
import { Logger } from "./logger";
import fetch from "cross-fetch";
import { Response } from "cross-fetch";
import { exec } from "node:child_process";

interface TokenResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

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
		tokenUrl: string,
	) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.authorizeUrl = authorizeUrl;
		this.redirectUri = redirectUri;
		this.tokenUrl = tokenUrl;

		this.accessToken = null;
		this.refreshToken = null;
		this.tokenExpiresIn = null;
	}

	authorize(scope: string, state: string): void {
		const params = new URLSearchParams();
		params.append("client_id", this.clientId);
		params.append("redirect_uri", this.redirectUri);
		params.append("response_type", "code");
		params.append("scope", scope);
		params.append("state", state);

		const authorizationUrl = `${this.authorizeUrl}?${params.toString()}`;
		this.openBrowser(authorizationUrl);
	}

	async getAccessToken(code?: string): Promise<string | null> {
		if (this.accessToken == null) {
			if (code === undefined)
				throw new Error(
					"No code was provided to fetch access token. Please provide code by authorizing with service",
				);

			await this.exchangeCodeForToken(code);
			return this.accessToken;
		}

		if (this.isTokenExpired()) {
			try {
				await this.refreshAccessToken();
			} catch (error) {
				Logger.getInstance().logError(`refresh access token error: ${error}`);
			}

			return this.accessToken;
		}

		return this.accessToken;
	}

	async exchangeCodeForToken(code: string): Promise<void> {
		const params = new URLSearchParams();
		params.append("client_id", this.clientId);
		params.append("client_secret", this.clientSecret);
		params.append("redirect_uri", this.redirectUri);
		params.append("grant_type", "authorization_code");
		params.append("code", code);

		await this.updateTokenState(params);
	}

	async refreshAccessToken(): Promise<void> {
		if (this.refreshToken == null)
			throw new Error(`No refresh token available for ${this.authorizeUrl}`);

		const params = new URLSearchParams();
		params.append("client_id", this.clientId);
		params.append("client_secret", this.clientSecret);
		params.append("grant_type", "refresh_token");
		params.append("refresh_token", this.refreshToken);
		params.append("redirect_uri", this.redirectUri);

		await this.updateTokenState(params);
	}

	isTokenExpired(): boolean {
		return Date.now() >= (this.tokenExpiresIn ?? 0);
	}

	private async fetchToken(params: URLSearchParams): Promise<TokenResponse> {
		let response = new Response();
		let tryCounter = 0;
		console.log(this.tokenUrl);

		do {
			response = await fetch(this.tokenUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: params.toString(),
			});

			if (!response.ok) tryCounter++;
		} while (!response.ok && tryCounter < 3);

		const data = (await response.json()) as TokenResponse;
		this.handleAuthError(response, data, tryCounter);

		return data;
	}

	private openBrowser(url: string) {
		const platform = process.platform;
		if (platform === "win32") {
			exec(`start ${url}`);
		} else if (platform === "darwin") {
			exec(`open ${url}`);
		} else if (platform === "linux") {
			exec(`xdg-open ${url}`);
		}
	}

	private handleAuthError(
		response: Response,
		data: TokenResponse,
		tryCounter: number,
	): void {
		if (!response.ok) {
			throw new TokenError(
				`response.ok = false when trying to refresh token with ${this.tokenUrl}. Tried to refresh ${tryCounter} times`,
				response,
			);
		}

		if (!data.access_token) {
			throw new TokenError(
				`no access_token in data when refreshing access token for ${this.tokenUrl}`,
				response,
			);
		}
	}

	private async updateTokenState(params: URLSearchParams): Promise<void> {
		const tokenData = await this.fetchToken(params);
		this.accessToken = tokenData.access_token;
		this.refreshToken = tokenData.refresh_token;
		this.tokenExpiresIn = Date.now() + tokenData.expires_in * 1000;
	}
}
