import { FileWorkerManager } from "./file-worker-manager";
import { MAXFILEWORKERS } from "../utils/constants";

export class FileWorkerManagerPool {
	private maxWorkers: number;
	private activeWorkerManagers: FileWorkerManager[];
	private waitingQueue: Array<() => void>; // Queue for waiting objects

	constructor() {
		this.maxWorkers = MAXFILEWORKERS;
		this.activeWorkerManagers = [];
		this.waitingQueue = [];
	}

	// Request a worker manager when available, blocks until one is free
	public async requestWorker(): Promise<FileWorkerManager> {
		// If we have available workers, return one immediately
		if (this.activeWorkerManagers.length < this.maxWorkers) {
			const workerManager = new FileWorkerManager("file-worker.js");
			this.activeWorkerManagers.push(workerManager);
			return workerManager;
		}

		// If no workers are available, wait until one is released
		return new Promise((resolve) => {
			this.waitingQueue.push(() => {
				const workerManager = new FileWorkerManager("file-worker.js");
				this.activeWorkerManagers.push(workerManager);
				resolve(workerManager);
			});
		});
	}

	// Release a worker manager when the calling object is done with it
	public async releaseWorker(workerManager: FileWorkerManager): Promise<void> {
		const index = this.activeWorkerManagers.indexOf(workerManager);
		if (index !== -1) {
			this.activeWorkerManagers.splice(index, 1);
			await workerManager.terminate(); // Terminate the worker

			// If there are waiting requests in the queue, resolve the next one
			if (this.waitingQueue.length > 0) {
				const nextRequest = this.waitingQueue.shift();
				if (nextRequest) nextRequest(); // Pass control to the next waiting object
			}
		}
	}
}
