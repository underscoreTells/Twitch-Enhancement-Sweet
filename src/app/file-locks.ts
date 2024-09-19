import { Mutex } from "async-mutex";
import { Logger } from "./logger";

class FileLockManager {
	private static _instance: FileLockManager | null = null;
	private static _mutex = new Mutex();
	private static _checkFilePermissionMutex = new Mutex();
	private locks: Map<string, boolean>;
	private queues: Map<string, Worker[]>; //TODO: won't be queue of worker, but queue of file writers (whatever the object name ends up as).

	private constructor() {
		this.locks = new Map();
		this.queues = new Map();
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
	): Promise<boolean> {
		await FileLockManager._mutex.acquire();
		let available = false;

		try {
			available = await this.checkFilePermission(reference);
			if (!available) this.queue(worker, reference);
			else this.locks.set(reference, false);
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

	public async queue(worker: Worker, reference: string): Promise<void> {
		const available = await this.checkFilePermission(reference);

		if (available) await this.executeWorkerIO(worker, reference);
		else {
			const queue = this.queues.get(reference);

			if (queue !== undefined) queue.push(worker);
		}
	}

	public dequeue(worker: Worker, reference: string): void {
		const queue = this.queues.get(reference);

		if (queue !== undefined && queue.length > 0) {
			const index = queue.indexOf(worker);

			if (index !== -1) queue.splice(index, 1);
		}
	}

	public async release(worker: Worker, reference: string): Promise<void> {
		await FileLockManager._checkFilePermissionMutex.acquire();
		try {
			const queue = this.queues.get(reference);
			let lock = this.locks.get(reference);

			if (queue !== undefined && queue.length > 0)
				await this.executeWorkerIO(queue[0], reference);
			else if (lock !== undefined) {
				lock = true;
			}
		} finally {
			FileLockManager._checkFilePermissionMutex.release();
		}
	}

	private addFile(reference: string): void {
		if (this.locks.has(reference)) return;

		this.locks.set(reference, true);
	}

	private async executeWorkerIO(
		worker: Worker,
		reference: string,
	): Promise<void> {
		//TODO: call worker write/read file
		const queue = this.queues.get(reference);

		this.dequeue(worker, reference);
	}
}
