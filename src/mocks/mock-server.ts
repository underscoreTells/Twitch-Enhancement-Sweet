import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const handlers = [
	http.post("https://api.nightbot.tv/oauth2/token", () => {
		return HttpResponse.json(
			{
				access_token: "valid_access_token",
				refresh_token: "valid_refresh_token",
				expires_in: "3600",
			},
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}),
];

export const mockServer = setupServer(...handlers);
