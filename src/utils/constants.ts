import * as dotenv from "dotenv";

dotenv.config();

export const nightbotClientID =
	process.env.CLIENT_ID ??
	(() => {
		throw new Error("CLIENT_ID environment variable is not defined");
	})();

export const nightbotClientSecret =
	process.env.CLIENT_SECRET ??
	(() => {
		throw new Error("CLIENT_SECRET environment variable is not defined");
	})();

export const nightbotRedirectURI =
	process.env.REDIRECT_URI ??
	(() => {
		throw new Error("REDIRECT_URI environment variable is not defined");
	})();

export const nightbotTokenURL =
	process.env.TOKEN_URL ??
	(() => {
		throw new Error("TOKEN_URL environment variable is not defined");
	})();

export const nightbotAuthorizeURL =
	process.env.AUTHORIZE_URL ??
	(() => {
		throw new Error("AUTHORIZE_URL environment variable is not defined");
	})();

export const backEndAuthorizeURL =
	process.env.BACKEND_AUTH_URL ??
	(() => {
		throw new Error("AUTHORIZE_URL environment variable is not defined");
	})();
