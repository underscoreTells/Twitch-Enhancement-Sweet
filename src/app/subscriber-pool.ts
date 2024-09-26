import type { FileWorkerManagerPool } from "./file-worker-manager-pool";
import type { Message } from "./request-parser-interface";
import { Subscriber } from "./subscriber";

export class SubscriberPool {
	private subscribers: Map<string, Subscriber>;
	private filePool: FileWorkerManagerPool;

	constructor(filePool: FileWorkerManagerPool) {
		this.subscribers = new Map();
		this.filePool = filePool;
	}

	public getSubscriber(name: string): Subscriber {
		let subscriber = this.subscribers.get(name);

		if (subscriber !== undefined) return subscriber;

		subscriber = new Subscriber(
			name,
			this.filePool,
			(message: Message, filePool: FileWorkerManagerPool) => {
				throw new Error(`No function defined for subscriber: ${name}`);
			},
		);

		this.subscribers.set(name, subscriber);
		return subscriber;
	}

	public addSubscriber(subscriber: Subscriber): void {
		this.subscribers.set(subscriber.getName(), subscriber);
	}

	public delete(name: string) {
		const subscriber = this.subscribers.get(name);

		if (subscriber !== undefined) {
			subscriber.disable();
			this.subscribers.delete(name);
		}
	}
}
