export interface AuthServiceInterface {
	getAccessToken(scope: string): Promise<string | null>;
	refreshAccessToken(scope: string): Promise<void>;
	isTokenExpired(): boolean;
}
