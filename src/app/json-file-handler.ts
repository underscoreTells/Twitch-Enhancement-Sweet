import * as fs from "node:fs/promises";
import type { FileHandler } from "./file-handler";

export class JSONFileHandler implements FileHandler {
	//TODO

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async read(filePath: string): Promise<any> {
		const data = await fs.readFile(filePath, "utf-8");
		return JSON.parse(data);
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async write(filePath: string, data: any): Promise<void> {
		await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
	}
}
