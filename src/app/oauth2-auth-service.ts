import type { AuthServiceInterface } from "./auth-service-interface";
import { TokenError } from "./errors";
import { Logger } from "./logger";
import { exec } from "node:child_process";
import type { RequestServiceInterface } from "./request-service-interface";
import { HttpRequestService } from "./http-request-service";

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
	private requestService: RequestServiceInterface;

	constructor(args: Record<string, string>) {
		this.clientId = args.clientId;
		this.clientSecret = args.clientSecret;
		this.authorizeUrl = args.authorizeUrl;
		this.redirectUri = args.redirectUri;
		this.tokenUrl = args.tokenUrl;

		this.accessToken = null;
		this.refreshToken = null;
		this.tokenExpiresIn = null;

		this.requestService = new HttpRequestService();
	}

	public authorize(scope: string, state: string): void {
		const params = new URLSearchParams();
		params.append("client_id", this.clientId);
		params.append("redirect_uri", this.redirectUri);
		params.append("response_type", "code");
		params.append("scope", scope);
		params.append("state", state);

		const authorizationUrl = `${this.authorizeUrl}?${params.toString()}`;
		this.openBrowser(authorizationUrl);
	}

	public async getAccessToken(code?: string): Promise<string | null> {
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

	public async exchangeCodeForToken(code: string): Promise<void> {
		const params = {
			client_id: this.clientId,
			client_secret: this.clientSecret,
			redirect_uri: this.redirectUri,
			grant_type: "authorization_code",
			code: code,
		};

		await this.updateTokenState(params);
	}

	public async refreshAccessToken(): Promise<void> {
		if (this.refreshToken == null)
			throw new Error(`No refresh token available for ${this.authorizeUrl}`);

		const params = {
			client_id: this.clientId,
			client_secret: this.clientSecret,
			grant_type: "refresh_token",
			refresh_token: this.refreshToken,
			redirect_uri: this.redirectUri,
		};

		await this.updateTokenState(params);
	}

	isTokenExpired(): boolean {
		return Date.now() >= (this.tokenExpiresIn ?? 0);
	}

	private async fetchToken(
		params: Record<string, string>,
	): Promise<TokenResponse> {
		const methodArguments = {
			url: this.tokenUrl,
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params,
		};

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let response: any;
		let tryCounter = 0;

		do {
			response = await this.requestService.sendRequest(methodArguments);

			tryCounter++;
		} while (!response.ok && tryCounter < 3);

		const data = response as TokenResponse;
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

	private async updateTokenState(
		params: Record<string, string>,
	): Promise<void> {
		const tokenData = await this.fetchToken(params);
		this.accessToken = tokenData.access_token;
		this.refreshToken = tokenData.refresh_token;
		this.tokenExpiresIn = Date.now() + tokenData.expires_in * 1000;
	}
}
