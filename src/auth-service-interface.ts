export interface AuthServiceInterface {
	getAccessToken(): Promise<void>;
	refreshToken(): Promise<void>;
	handleAuthError(error: Error): void;
}
