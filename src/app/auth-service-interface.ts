export interface AuthServiceInterface {
	authorize(scope: string, state: string): void;
	getAccessToken(code?: string): Promise<string | null>;
	exchangeCodeForToken(code: string): Promise<void>;
	refreshAccessToken(): Promise<void>;
	isTokenExpired(): boolean;
}
