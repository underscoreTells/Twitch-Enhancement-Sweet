import { parentPort } from "node:worker_threads";
import { JSONFileHandler } from "./json-file-handler";
import { TextFileHandler } from "./texte-file-handler";
import { BinaryFileHandler } from "./binary-file-handler";
import type { FileHandler } from "./file-handler";

if (parentPort && parentPort !== null) {
	const fileHandlers: Record<string, FileHandler> = {
		json: new JSONFileHandler(),
		text: new TextFileHandler(),
		binary: new BinaryFileHandler(),
	};

	parentPort.on("message", async (message) => {
		const { type, action, filePath, data } = message;
		const handler = fileHandlers[type];

		if (handler) {
			try {
				if (action === "read") {
					const result = await handler.read(filePath);
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					parentPort!.postMessage(result);
				} else if (action === "write") {
					await handler.write(filePath, data);
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					parentPort!.postMessage("Write successful");
				}
			} catch (error) {
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				parentPort!.postMessage(`Error: ${error}`);
			}
		} else {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			parentPort!.postMessage("Unknown file type");
		}
	});
}
