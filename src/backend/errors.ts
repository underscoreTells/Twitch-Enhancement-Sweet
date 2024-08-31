import type { Response } from "node-fetch";

export class RefreshTokenError extends Error {
	response: Response;

	constructor(message: string, response: Response) {
		super(message);
		this.name = "RefreshTokenError";
		this.response = response;
	}
}
