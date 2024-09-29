import type {
	AuthServiceInterface,
	TokenResponse,
	ServiceInfo,
} from "./auth-service-interface";
import { TokenError } from "./errors";
import { Logger } from "./logger";
import { exec } from "node:child_process";
import type { RequestServiceInterface } from "./request-service-interface";
import { HttpRequestService } from "./http-request-service";
import { injectable } from "tsyringe";
import type { Application } from "express";

@injectable()
export class OAuth2AuthService implements AuthServiceInterface {
	private service: ServiceInfo;
	private requestService: RequestServiceInterface;
	private callbackResolver: (value: string) => void;

	constructor(
		service: ServiceInfo,
		serviceName: string,
		private server: Application,
	) {
		this.service = service;

		this.requestService = new HttpRequestService();
		this.callbackResolver = (value: string) => {
			return "";
		};

		this.server.post(`/auth/${serviceName}`, (req, res) => {
			const { code, error } = req.query;

			if (error) {
				const errorMessage = `Authorization failed with error: ${error}`;
				res.status(400).json({ error: errorMessage });
				Logger.getInstance().logError(
					`invalid auth request for ${serviceName}. Received error instead of auth code when authenticating`,
				);
				return;
			}

			if (code !== undefined) {
				res.status(200).json({ success: true, code });
				this.callbackResolver(code as string);
			} else {
				res.status(400).json({ error: "Authorization code not found" });
				this.callbackResolver("access_denied");
			}
		});
	}

	public authorize(scope: string, state: string): Promise<string> {
		const params = new URLSearchParams();
		params.append("client_id", this.service.clientId);
		params.append("redirect_uri", this.service.redirectUri);
		params.append("response_type", "code");
		params.append("scope", scope);
		params.append("state", state);

		const authorizationUrl = `${this.service.authorizeUrl}?${params.toString()}`;
		this.openBrowser(authorizationUrl);

		return new Promise((resolve) => {
			this.callbackResolver = resolve;
		});
	}

	public async getAccessToken(code?: string): Promise<ServiceInfo | null> {
		if (this.service.accessToken == null) {
			if (code === undefined)
				throw new Error(
					"No code was provided to fetch access token. Please provide code by authorizing with service",
				);

			await this.exchangeCodeForToken(code);
			return this.service;
		}

		if (this.isTokenExpired()) {
			try {
				await this.refreshAccessToken();
			} catch (error) {
				Logger.getInstance().logError(`refresh access token error: ${error}`);
			}

			return this.service;
		}

		return this.service;
	}

	public async exchangeCodeForToken(code: string): Promise<void> {
		const params = {
			client_id: this.service.clientId,
			client_secret: this.service.clientSecret,
			redirect_uri: this.service.redirectUri,
			grant_type: "authorization_code",
			code: code,
		};

		await this.updateTokenState(params);
	}

	public async refreshAccessToken(): Promise<void> {
		if (this.service.refreshToken == null)
			throw new Error(
				`No refresh token available for ${this.service.authorizeUrl}`,
			);

		const params = {
			client_id: this.service.clientId,
			client_secret: this.service.clientSecret,
			grant_type: "refresh_token",
			refresh_token: this.service.refreshToken,
			redirect_uri: this.service.redirectUri,
		};

		await this.updateTokenState(params);
	}

	public isTokenExpired(): boolean {
		return Date.now() >= (this.service.tokenExpiresIn ?? 0);
	}

	private async fetchToken(
		params: Record<string, string>,
	): Promise<TokenResponse> {
		const methodArguments = {
			url: this.service.tokenUrl,
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
				`response.ok = false when trying to refresh token with ${this.service.tokenUrl}. Tried to refresh ${tryCounter} times`,
				response,
			);
		}

		if (!data.access_token) {
			throw new TokenError(
				`no access_token in data when refreshing access token for ${this.service.tokenUrl}`,
				response,
			);
		}
	}

	private async updateTokenState(
		params: Record<string, string>,
	): Promise<void> {
		const tokenData = await this.fetchToken(params);
		this.service.accessToken = tokenData.access_token;
		this.service.refreshToken = tokenData.refresh_token;
		this.service.tokenExpiresIn = Date.now() + tokenData.expires_in * 1000;
	}
}
