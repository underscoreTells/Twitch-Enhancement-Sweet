import { Worker } from "node:worker_threads";
import path from "node:path";

export type WorkerMessage = {
	action: string;
	filePath: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	data?: any;
};

export class FileWorkerManager {
	private worker: Worker;

	constructor(workerFile: string) {
		// Initialize the worker with the given worker file (e.g., json-worker.js, text-worker.js)
		this.worker = new Worker(path.resolve(__dirname, workerFile));

		// Listen for messages from the worker
		this.worker.on("message", (message) => {
			console.log(`Received from worker: ${message}`);
		});

		// Listen for errors
		this.worker.on("error", (error) => {
			console.error(`Worker error: ${error}`);
		});

		// Listen for worker exit
		this.worker.on("exit", (code) => {
			if (code !== 0) {
				console.log(`Worker stopped with exit code ${code}`);
			}
		});
	}

	// Method to send a task to the worker
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	read(filePath: string, data?: any): void {
		const workerMessage: WorkerMessage = {
			action: "read",
			filePath: filePath,
			data: data,
		};

		this.worker.postMessage(workerMessage);
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	write(filePath: string, data?: any): void {
		const workerMessage: WorkerMessage = {
			action: "write",
			filePath: filePath,
			data: data,
		};

		this.worker.postMessage(workerMessage);
	}

	// Method to terminate the worker
	terminate() {
		this.worker.terminate();
	}
}
