export interface HandlerFactory {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	getHandlerFunction(handler: Function): any;
}
