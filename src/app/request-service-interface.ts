export interface RequestServiceInterface {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	sendRequest(methodArguments: Record<string, any>): Promise<any>;
}
