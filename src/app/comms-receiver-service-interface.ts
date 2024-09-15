export interface CommsReceiverInterface {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	addHandler(event: string, handler: Function, path?: string): void;
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	removeHandler(event: string, handler: Function, path?: string): void;
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	updateHandler(event: string, handler: Function, path?: string): void;
}
