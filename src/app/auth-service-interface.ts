export interface TokenResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

export class ServiceInfo {
	constructor(
		public serviceName = "",
		public clientId = "",
		public clientSecret = "",
		public tokenUrl = "",
		public authorizeUrl = "",
		public redirectUri = "",
		public accessToken: string | null = null,
		public refreshToken: string | null = null,
		public tokenExpiresIn: number | null = null,
	) {}

	public ToJSON() {
		return {
			serviceName: this.serviceName,
			clientId: "",
			clientSecret: "",
			tokenUrl: "",
			authorizeUrl: "",
			redirectUri: "",
			accessToken: "",
			refreshToken: this.refreshToken,
			tokenExpiresIn: this.tokenExpiresIn,
		};
	}
}

export interface AuthServiceInterface {
	authorize(scope: string, state: string): Promise<string>;
	getAccessToken(code?: string): Promise<ServiceInfo | null>;
	exchangeCodeForToken(code: string): Promise<void>;
	refreshAccessToken(): Promise<void>;
	isTokenExpired(): boolean;
}
