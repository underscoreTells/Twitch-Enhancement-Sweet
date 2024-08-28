import { AuthServiceInterface } from "./auth-service-interface";
import { Logger } from "./logger";

export class OAuth2AuthService extends AuthServiceInterface {
    constructor({ clientId, clientSecret, tokenUrl, redirectUri }) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenUrl = tokenUrl;
        this.redirectUri = redirectUri;

        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiresIn = null;
    }

    async getAccessToken(scope) {
        if (!this.accessToken || this.isTokenExpired()) {
            await this.refreshToken();
        }
        return this.accessToken;
    }

    async refreshToken(scope) {
        const params = new URLSearchParams();
        params.append('client_id', this.clientId);
        params.append('client_secret', this.clientSecret);
        params.append('grant_type', 'client_credentials');
        params.append('redirect_uri', this.redirectUri);
        params.append('scope', scope);

        try {
            const response = await fetch(this.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.tokenExpiresIn = Date.now() + data.expires_in * 1000;
        } catch (error) {
            this.#handleAuthError(error);
        }
    }

    isTokenExpired() {
        return Date.now() >= this.tokenExpiresIn;
    }

    #handleAuthError(error) {
        const logger = new Logger();

        logger.log('authentication error');
    }
}
