import * as fs from "node:fs/promises";
import type { FileHandler } from "./file-handler";

export class TextFileHandler implements FileHandler {
	//TODO

	async read(filePath: string): Promise<string> {
		return fs.readFile(filePath, "utf-8");
	}

	async write(filePath: string, data: string): Promise<void> {
		await fs.writeFile(filePath, data, "utf-8");
	}
}
