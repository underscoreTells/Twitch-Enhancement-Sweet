import type { CommsReceiverInterface } from "./comms-receiver-service-interface";
import { HttpHandlerFactory } from "./http-handler-factory";
import type { Application, Request, Response } from "express";
import { Logger } from "./logger";

export class WebhookReceiver implements CommsReceiverInterface {
	private server: Application;
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	private handlers: Map<string, [Function, boolean]>;

	constructor(server: Application) {
		this.server = server;
		this.handlers = new Map();
	}

	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	addHandler(event: string, handler: Function, path?: string): void {
		if (path === undefined)
			throw new Error(
				"No path defined when trying to assign callback to express server. Path needs to be defined in this case",
			);

		const handlerValue = this.handlers.get(JSON.stringify([event, path]));

		if (handlerValue && handlerValue[1] === true)
			throw new Error(
				`Tryin to add callback for ${event}. Callback already assigned for ${event}`,
			);

		try {
			this.assignRequest(event, handler, path);
			this.handlers.set(JSON.stringify([event, path]), [handler, true]);
		} catch (error) {
			Logger.getInstance().logError(
				`Error when trying to assign request type to express server: ${error}`,
			);
		}
	}

	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	removeHandler(event: string, handler: Function, path?: string): void {
		if (path === undefined)
			throw new Error(
				"No path defined when trying to remove callback from express server. Path needs to be defined in this case",
			);

		const handlerValue = this.handlers.get(JSON.stringify([event, path]));

		if (handlerValue && handlerValue[1] === false)
			throw new Error(
				`Tryin to remove callback for ${event}. No callback is assigned for ${event}`,
			);

		const emptyFunction = (req: Request, res: Response) => {
			return res.status(503).send("listener is disabled");
		};

		try {
			this.assignRequest(event, emptyFunction, path);
			this.handlers.set(JSON.stringify([event, path]), [emptyFunction, false]);
		} catch (error) {
			Logger.getInstance().logError(
				`Error when trying to assign request type to express server: ${error}`,
			);
		}
	}

	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	updateHandler(event: string, handler: Function, path?: string): void {
		const handlerValue = this.handlers.get(JSON.stringify([event, path]));

		if (handlerValue === undefined)
			throw new Error(
				`No value assigned to [${event}, ${path}] when trying to update callback function`,
			);

		try {
			this.removeHandler(event, handlerValue[0], path);
			this.addHandler(event, handler, path);
		} catch (error) {
			Logger.getInstance().logError(
				`Error when trying to update callback function for [${event}, ${path}]: ${error}`,
			);
		}
	}

	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	private assignRequest(event: string, handler: Function, path: string): void {
		switch (event) {
			case "post":
				this.server.post(
					path,
					new HttpHandlerFactory().getHandlerFunction(handler),
				);
				break;
			case "get":
				this.server.get(
					path,
					new HttpHandlerFactory().getHandlerFunction(handler),
				);
				break;
			default:
				throw new Error(
					`Trying to assign function to express server. No request function defined for ${event}`,
				);
		}
	}
}
