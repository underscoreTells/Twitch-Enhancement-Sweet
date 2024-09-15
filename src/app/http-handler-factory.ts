import type { HandlerFactory } from "./handler-function-factory-interface";
import type { Request, Response } from "express";

export class HttpHandlerFactory implements HandlerFactory {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	getHandlerFunction(handler: Function): any {
		return (req: Request, res: Response) => {
			handler(req, res);
		};
	}
}
