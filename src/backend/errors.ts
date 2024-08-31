import type { Response } from "node-fetch";

export class TokenError extends Error {
	response: Response;

	constructor(message: string, response: Response) {
		super(message);
		this.name = "RefreshTokenError";
		this.response = response;
	}
}
