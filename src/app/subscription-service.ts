import { Logger } from "./logger";

export type Subscriber = {
	name: () => string;
	execute: () => void;
};

export class SubscriptionService {
	private subscribers: Map<string, Set<Subscriber>>;

	constructor() {
		this.bind();

		this.subscribers = new Map<string, Set<Subscriber>>();
	}

	subscribe(event: string, subscriber: Subscriber): void {
		if (!this.subscribers.has(event)) {
			this.subscribers.set(event, new Set<Subscriber>());
		}
		this.subscribers.get(event)?.add(subscriber);
	}

	// Method to unsubscribe from an event
	unsubscribe(event: string, subscriber: Subscriber): void {
		const logger = Logger.getInstance();

		if (!this.subscribers.has(event)) {
			logger.logError(
				`Trying to unsubscribe from unexisting event: ${event}. Unsubscribe was not executed`,
			);
			return;
		}

		if (!this.subscribers.get(event)?.has(subscriber)) {
			logger.logError(
				`Trying to unsubscribe from unexisting listener: ${subscriber.name()}. Unsubscribe was not executed`,
			);
			return;
		}

		const subscriberSet = this.subscribers.get(event);

		if (subscriberSet !== undefined) {
			subscriberSet.delete(subscriber);

			// If the set is empty, remove the event from the map
			if (subscriberSet.size === 0) {
				this.subscribers.delete(event);
			}

			return;
		}

		logger.log("tried to unsubscribe from undefined subscriber set");
	}

	notify(event: string): void {
		const logger = Logger.getInstance();

		if (this.isEmpty(event)) {
			logger.log(
				`Notifying for unexisting event: ${event}. No notification was sent`,
			);
			return;
		}

		const eventSubscribers = this.subscribers.get(event);

		if (eventSubscribers !== undefined) {
			for (const subscriber of eventSubscribers) subscriber.execute();
		}
	}

	private isEmpty(event: string): boolean {
		const eventSubscribers = this.subscribers.get(event);

		return (
			eventSubscribers === null ||
			eventSubscribers === undefined ||
			(eventSubscribers instanceof Set && eventSubscribers.size === 0)
		);
	}

	private bind(): void {
		this.subscribe = this.subscribe.bind(this);
		this.unsubscribe = this.unsubscribe.bind(this);
		this.notify = this.notify.bind(this);
		this.isEmpty = this.isEmpty.bind(this);
	}
}
