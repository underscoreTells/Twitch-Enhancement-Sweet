import { Mutex } from "async-mutex";
import { Logger } from "./logger";
import type { WorkerMessage } from "./file-worker-manager";

export class FileLockManager {
	private static _instance: FileLockManager | null = null;
	private static _mutex = new Mutex();
	private static _checkFilePermissionMutex = new Mutex();
	private locks: Map<string, boolean>;
	private queues: Map<string, Worker[]>;
	private messages: Map<Worker, WorkerMessage>;

	private constructor() {
		this.locks = new Map();
		this.queues = new Map();
		this.messages = new Map();
	}

	public static async getInstance(): Promise<FileLockManager> {
		await FileLockManager._mutex.acquire();

		try {
			if (FileLockManager._instance === null) {
				FileLockManager._instance = new FileLockManager();
			}
		} finally {
			FileLockManager._mutex.release();
		}

		return FileLockManager._instance;
	}

	public async getFilePermission(
		worker: Worker,
		reference: string,
		message: WorkerMessage,
	): Promise<boolean> {
		await FileLockManager._mutex.acquire();
		let available = false;

		try {
			available = await this.checkFilePermission(reference);
			if (!available) {
				await this.queue(worker, reference, message);
				this.messages.set(worker, message);
			} else this.locks.set(reference, false);
		} finally {
			FileLockManager._mutex.release();
		}

		return available;
	}

	public async checkFilePermission(reference: string): Promise<boolean> {
		await FileLockManager._checkFilePermissionMutex.acquire();
		let available = false;

		try {
			this.addFile(reference);
			const lock = this.locks.get(reference);

			if (lock !== undefined) available = lock;
			else {
				Logger.getInstance().logError(
					`No lock value for ${reference}, adding value to file reference`,
				);
				this.locks.set(reference, true);
				available = true;
			}
		} finally {
			FileLockManager._checkFilePermissionMutex.release();
		}

		return available;
	}

	public async queue(
		worker: Worker,
		reference: string,
		message: WorkerMessage,
	): Promise<void> {
		const available = await this.checkFilePermission(reference);

		if (available) await this.executeWorkerIO(worker, reference);
		else {
			const queue = this.queues.get(reference);

			if (queue !== undefined && queue.indexOf(worker) !== -1)
				queue.push(worker);

			this.messages.set(worker, message);
		}
	}

	public dequeue(worker: Worker, reference: string): void {
		const queue = this.queues.get(reference);

		if (queue !== undefined && queue.length > 0) {
			const index = queue.indexOf(worker);

			if (index !== -1) {
				queue.splice(index, 1);
				this.messages.delete(worker);
			}
		}
	}

	public async release(reference: string): Promise<void> {
		await FileLockManager._checkFilePermissionMutex.acquire();
		try {
			let lock = this.locks.get(reference);

			if (lock !== undefined) {
				lock = true;
			}
		} finally {
			FileLockManager._checkFilePermissionMutex.release();
		}

		const queue = this.queues.get(reference);
		if (queue !== undefined && queue.length > 0)
			await this.executeWorkerIO(queue[0], reference);
	}

	private addFile(reference: string): void {
		if (this.locks.has(reference)) return;

		this.locks.set(reference, true);
	}

	private async executeWorkerIO(
		worker: Worker,
		reference: string,
	): Promise<void> {
		const message = this.messages.get(worker);

		worker.postMessage(message);
		this.dequeue(worker, reference);
	}
}
