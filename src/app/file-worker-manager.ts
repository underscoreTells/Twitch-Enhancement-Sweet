import { Worker } from "node:worker_threads";
import path from "node:path";
import { FileLockManager } from "./file-locks";
import type { FileIO } from "./file-io";

export type WorkerMessage = {
	type: string;
	action: string;
	filePath: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	data?: any;
};

export class FileWorkerManager {
	private worker: Worker;
	private currentFilePath: string;
	private callingObject: FileIO | null = null;

	constructor(workerFile: string) {
		// Initialize the worker with the given worker file (e.g., json-worker.js, text-worker.js)
		this.worker = new Worker(path.resolve(__dirname, workerFile));
		this.currentFilePath = "";

		// Listen for messages from the worker
		this.worker.on("message", (message) => {
			console.log(`Received from worker: ${message}`);

			if (this.callingObject != null && message?.data) {
				this.callingObject.receiveData(message.data);
				return;
			}

			throw new Error(
				`Object reading file ${this.currentFilePath} not defined. Can't return data to null object`,
			);
		});

		// Listen for errors
		this.worker.on("error", (error) => {
			console.error(`Worker error: ${error}`);
		});

		// Listen for worker exit
		this.worker.on("exit", async (code) => {
			if (code !== 0) {
				console.log(`Worker stopped with exit code ${code}`);
			}
			if (this.currentFilePath !== "") {
				await (await FileLockManager.getInstance()).release(
					this.currentFilePath,
				);
				this.currentFilePath = "";
			}
		});
	}

	// Method to send a task to the worker
	public async read(
		filePath: string,
		callingObject: FileIO,
		type: string,
	): Promise<void> {
		const workerMessage: WorkerMessage = {
			type: type,
			action: "read",
			filePath: filePath,
			data: "",
		};

		this.callingObject = callingObject;
		this.sendMessage(filePath, workerMessage);
	}

	public async write(
		filePath: string,
		type: string,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		data?: any,
	): Promise<void> {
		const workerMessage: WorkerMessage = {
			type: type,
			action: "write",
			filePath: filePath,
			data: data,
		};

		this.sendMessage(filePath, workerMessage);
	}

	// Method to terminate the worker
	public async terminate(): Promise<void> {
		this.worker.terminate();

		if (this.currentFilePath !== "") {
			await (await FileLockManager.getInstance()).release(this.currentFilePath);
			this.currentFilePath = "";
		}

		this.callingObject = null;
	}

	private async sendMessage(
		filePath: string,
		workerMessage: WorkerMessage,
	): Promise<void> {
		this.callingObject = null;

		this.currentFilePath = filePath;

		const available = await (
			await FileLockManager.getInstance()
		).getFilePermission(this.worker, filePath, workerMessage);

		if (available) this.worker.postMessage(workerMessage);
	}
}
