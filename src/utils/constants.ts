import * as dotenv from "dotenv";

dotenv.config();

// Nightbot constants
export const NIGHTBOTCLIENTID =
	process.env.NIGHTBOT_CLIENT_ID ??
	(() => {
		throw new Error("NIGHTBOT_CLIENT_ID environment variable is not defined");
	})();

export const NIGHTBOTCLIENTSECRET =
	process.env.NIGHTBOT_CLIENT_SECRET ??
	(() => {
		throw new Error(
			"NIGHTBOT_CLIENT_SECRET environment variable is not defined",
		);
	})();

export const NIGHTBOTREDIRECTURI =
	process.env.NIGHTBOT_REDIRECT_URI ??
	(() => {
		throw new Error(
			"NIGHTBOT_REDIRECT_URI environment variable is not defined",
		);
	})();

export const NIGHTBOTTOKENURL =
	process.env.NIGHTBOT_TOKEN_URL ??
	(() => {
		throw new Error("NIGHTBOT_TOKEN_URL environment variable is not defined");
	})();

export const NIGHTBOTAUTHORIZEURL =
	process.env.NIGHTBOT_AUTHORIZE_URL ??
	(() => {
		throw new Error(
			"NIGHTBOT_AUTHORIZE_URL environment variable is not defined",
		);
	})();

// Twitch constants
export const TWITCHCLIENTID =
	process.env.TWITCH_CLIENT_ID ??
	(() => {
		throw new Error("NIGHTBOT_CLIENT_ID environment variable is not defined");
	})();

export const TWITCHCLIENTSECRET =
	process.env.TWITCH_CLIENT_SECRET ??
	(() => {
		throw new Error(
			"NIGHTBOT_CLIENT_SECRET environment variable is not defined",
		);
	})();

export const TWITCHREDIRECTURI =
	process.env.TWITCH_REDIRECT_URI ??
	(() => {
		throw new Error(
			"NIGHTBOT_REDIRECT_URI environment variable is not defined",
		);
	})();

export const TWITCHTOKENURL =
	process.env.TWITCH_TOKEN_URL ??
	(() => {
		throw new Error("NIGHTBOT_TOKEN_URL environment variable is not defined");
	})();

export const TWITCHAUTHORIZEURL =
	process.env.TWITCH_AUTHORIZE_URL ??
	(() => {
		throw new Error(
			"NIGHTBOT_AUTHORIZE_URL environment variable is not defined",
		);
	})();

// Streamlabs constants
export const STREAMLABSCLIENTID =
	process.env.STREAMLABS_CLIENT_ID ??
	(() => {
		throw new Error("NIGHTBOT_CLIENT_ID environment variable is not defined");
	})();

export const STREAMLABSCLIENTSECRET =
	process.env.STREAMLABS_CLIENT_SECRET ??
	(() => {
		throw new Error(
			"NIGHTBOT_CLIENT_SECRET environment variable is not defined",
		);
	})();

export const STREAMLABSREDIRECTURI =
	process.env.STREAMLABS_REDIRECT_URI ??
	(() => {
		throw new Error(
			"NIGHTBOT_REDIRECT_URI environment variable is not defined",
		);
	})();

export const STREAMLABSTOKENURL =
	process.env.STREAMLABS_TOKEN_URL ??
	(() => {
		throw new Error("NIGHTBOT_TOKEN_URL environment variable is not defined");
	})();

export const STREAMLABSAUTHORIZEURL =
	process.env.STREAMLABS_AUTHORIZE_URL ??
	(() => {
		throw new Error(
			"NIGHTBOT_AUTHORIZE_URL environment variable is not defined",
		);
	})();

// Max number of simultaneous files
export const MAXFILEWORKERS = 10;

// Services storage file path
export const SERVICESPATH = "../../storage/services.json";
