import * as fs from "node:fs/promises";
import type { FileHandler } from "./file-handler";

export class BinaryFileHandler implements FileHandler {
	//TODO

	async read(filePath: string): Promise<Buffer> {
		return fs.readFile(filePath);
	}

	async write(filePath: string, data: Buffer): Promise<void> {
		await fs.writeFile(filePath, data);
	}
}
