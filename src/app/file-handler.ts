// fileHandler.ts
export interface FileHandler {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	read(filePath: string): Promise<any>;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	write(filePath: string, data: any): Promise<void>;
}
