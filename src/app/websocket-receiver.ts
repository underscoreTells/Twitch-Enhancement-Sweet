import { WebSocket } from "ws";
import type { CommsReceiverInterface } from "./comms-receiver-service-interface";
import { WebsocketHandlerFactory } from "./websocket-handler-factory";

export class WebsocketReceiver implements CommsReceiverInterface {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	private handlers: Map<string, Function>;
	private websocket: WebSocket;

	constructor(connectionUrl: string) {
		this.websocket = new WebSocket(connectionUrl);
		this.handlers = new Map();
	}

	// biome-ignore lint/complexity/noBannedTypes: Allowed due to ws library usage
	addHandler(event: string, handler: Function, path?: string): void {
		if (this.handlers.has(event))
			throw new Error(
				`Tryin to add callback for ${event}. Callback already assigned for ${event}`,
			);

		this.websocket.on(
			event,
			new WebsocketHandlerFactory().getHandlerFunction(handler),
		);
		this.handlers.set(event, handler);
	}

	// biome-ignore lint/complexity/noBannedTypes: Allowed due to ws library usage
	removeHandler(event: string, handler: Function, path?: string): void {
		if (!this.handlers.has(event))
			throw new Error(
				`Trying to delete callback for ${event}. No callback is defined for ${event}`,
			);

		this.websocket.off(
			event,
			new WebsocketHandlerFactory().getHandlerFunction(handler),
		);
		this.handlers.delete(event);
	}

	// biome-ignore lint/complexity/noBannedTypes: Allowed due to ws library usage
	updateHandler(event: string, handler: Function, path?: string): void {
		if (!this.handlers.has(event))
			throw new Error(
				`Trying to update callback for ${event}. No callback is defined for ${event}`,
			);

		const handlerFunction = this.handlers.get(event);

		if (typeof handlerFunction === "function") {
			this.removeHandler(event, handlerFunction, path);
			this.addHandler(event, handler, path);
		} else
			throw new Error(
				`Trying to update callback for ${event}. Associated function is of type undefined`,
			);
	}
}
