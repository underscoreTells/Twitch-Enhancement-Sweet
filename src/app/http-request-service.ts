import type { RequestServiceInterface } from "./request-service-interface";
import { fetch } from "cross-fetch";

export class HttpRequestService implements RequestServiceInterface {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async sendRequest(methodArguments: Record<string, any>): Promise<any> {
		const { url, method = "GET", headers = {}, body } = methodArguments;

		if (!url)
			throw new Error("URL not provided for HTTP request. URL is mandatory");

		const requestHeaders: HeadersInit = {
			...headers,
			"Content-Type": headers["Content-Type"] || "application/json", // Set Content-Type explicitly
		};

		const requestOptions: RequestInit = {
			method,
			headers: requestHeaders,
		};

		// Only include body if method is POST, PUT, PATCH, or DELETE
		if (
			["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) &&
			body
		) {
			const contentType = (
				requestHeaders as Record<string, string | undefined>
			)["Content-Type"];
			if (contentType === "application/x-www-form-urlencoded") {
				// Convert body to URL-encoded string format
				requestOptions.body = new URLSearchParams(body).toString();
			} else {
				// Default to JSON encoding
				requestOptions.body = JSON.stringify(body);
			}
		}

		try {
			const response = await fetch(url, requestOptions);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Check the Content-Type of the response
			const contentType = response.headers.get("Content-Type");

			if (contentType?.includes("application/json")) {
				// If the response is JSON
				return await response.json();
			}
			if (contentType?.includes("application/x-www-form-urlencoded")) {
				// If the response is URL-encoded
				const text = await response.text();
				return new URLSearchParams(text); // Parse and return URL-encoded data as key-value pairs
			}
			if (contentType?.includes("text/plain")) {
				// If the response is plain text
				return await response.text();
			}
			// Default to returning the raw response body as a Blob for unknown types
			return await response.blob();
		} catch (error) {
			console.error("Request failed:", error);
			throw error;
		}
	}
}
