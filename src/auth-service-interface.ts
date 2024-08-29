export class AuthServiceInterface {
    constructor() {
        if (new.target === AuthServiceInterface) {
            throw new Error("Cannot instantiate an interface directly.");
        }
    }

    async getAccessToken() {
        throw new Error("Method 'getAccessToken()' must be implemented.");
    }

    async refreshToken() {
        throw new Error("Method 'refreshToken()' must be implemented.");
    }

    handleAuthError(error) {
        throw new Error("Method 'handleAuthError()' must be implemented.");
    }
}