import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { nightbotAuthorizeURL, nightbotTokenURL } from "../utils/constants";

const response = () => {
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
};

export const handlers = [
	http.post(nightbotTokenURL, response),
	http.post(nightbotAuthorizeURL, response),
];

export const mockServer = setupServer(...handlers);
