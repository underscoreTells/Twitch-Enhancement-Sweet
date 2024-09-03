import * as dotenv from "dotenv";

dotenv.config();

export const nightbotClientID =
	process.env.NIGHTBOT_CLIENT_ID ??
	(() => {
		throw new Error("NIGHTBOT_CLIENT_ID environment variable is not defined");
	})();

export const nightbotClientSecret =
	process.env.NIGHTBOT_CLIENT_SECRET ??
	(() => {
		throw new Error(
			"NIGHTBOT_CLIENT_SECRET environment variable is not defined",
		);
	})();

export const nightbotRedirectURI =
	process.env.NIGHTBOT_REDIRECT_URI ??
	(() => {
		throw new Error(
			"NIGHTBOT_REDIRECT_URI environment variable is not defined",
		);
	})();

export const nightbotTokenURL =
	process.env.NIGHTBOT_TOKEN_URL ??
	(() => {
		throw new Error("NIGHTBOT_TOKEN_URL environment variable is not defined");
	})();

export const nightbotAuthorizeURL =
	process.env.NIGHTBOT_AUTHORIZE_URL ??
	(() => {
		throw new Error(
			"NIGHTBOT_AUTHORIZE_URL environment variable is not defined",
		);
	})();
