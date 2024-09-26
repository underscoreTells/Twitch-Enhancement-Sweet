import type { FileHandle } from "node:fs/promises";
import * as fs from "node:fs/promises";
import { fs as memfs } from "memfs";
import type { FileHandler } from "./file-handler";

export class JSONFileHandler implements FileHandler {
	private fileSystem: typeof fs;

	constructor(fileSystem: typeof fs = fs) {
		this.fileSystem = fileSystem;
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	public async read(filePath: string): Promise<any> {
		if (await this.fileExists(filePath)) {
			const data = await this.fileSystem.readFile(filePath, "utf-8");
			return JSON.parse(data);
		}

		await this.write(filePath, {});
		return {};
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	public async write(filePath: string, data: any): Promise<void> {
		await this.fileSystem.writeFile(
			filePath,
			JSON.stringify(data, null, 2),
			"utf-8",
		);
	}

	private async fileExists(filePath: string): Promise<boolean> {
		return this.fileSystem
			.stat(filePath)
			.then(() => true)
			.catch(() => false);
	}
}
