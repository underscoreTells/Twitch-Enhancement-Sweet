import type { HandlerFactory } from "./handler-function-factory-interface";

export class WebsocketHandlerFactory implements HandlerFactory {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	getHandlerFunction(handler: Function): any {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		return function (this: WebSocket, ...args: any[]) {
			handler.apply(this, args);
		};
	}
}
