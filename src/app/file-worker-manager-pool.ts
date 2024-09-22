import { FileWorkerManager } from "./file-worker-manager";
import { MAXFILEWORKERS } from "../utils/constants";

export class FileWorkerManagerPool {
	private maxWorkers: number;
	private activeWorkerManagers: FileWorkerManager[];
	private standbyQueue: FileWorkerManager[];
	private totalWorkers: number;
	private waitingResolvers: ((value: FileWorkerManager) => void)[] = [];

	constructor() {
		this.maxWorkers = MAXFILEWORKERS;
		this.activeWorkerManagers = [];
		this.standbyQueue = [];
		this.totalWorkers = 0;
	}

	// Request a worker manager when available, blocks until one is free
	public async requestWorker(): Promise<FileWorkerManager> {
		if (this.standbyQueue.length > 0) {
			const fileManager = this.standbyQueue.pop();

			if (fileManager !== undefined) {
				this.activeWorkerManagers.push(fileManager);
				return fileManager;
			}

			throw new Error(
				"undefined FileWorkerManager when trying to request a worker",
			);
		}

		if (this.totalWorkers < this.maxWorkers) {
			const fileManager = new FileWorkerManager("file-worker.js");
			this.activeWorkerManagers.push(fileManager);
			this.totalWorkers++;
			return fileManager;
		}

		return new Promise<FileWorkerManager>((resolve) => {
			// Add the resolve function to the queue
			this.waitingResolvers.push(resolve);
		});
	}

	// Release a worker manager when the calling object is done with it
	public async releaseWorker(workerManager: FileWorkerManager): Promise<void> {
		// Remove the worker from active managers
		const index = this.activeWorkerManagers.indexOf(workerManager);
		if (index > -1) {
			this.activeWorkerManagers.splice(index, 1);
		}

		// Case 1: If there are waiting promises, resolve the oldest one
		if (this.waitingResolvers.length > 0) {
			const resolve = this.waitingResolvers.shift(); // Get the first waiting resolve
			if (resolve) {
				resolve(workerManager); // Resolve the promise with the worker
			}
		} else {
			// Case 2: If no one is waiting, move the worker to the standby queue
			this.standbyQueue.push(workerManager);
		}
	}
}
