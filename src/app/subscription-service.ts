import { Logger } from "./logger";
import type { Message } from "./request-parser-interface";
import type { Subscriber } from "./subscriber";
import type { ThirdPartyService } from "./third-party-service";

export class SubscriptionService {
	private subscribers: Map<string, Set<Subscriber>>;

	constructor() {
		this.subscribers = new Map<string, Set<Subscriber>>();
	}

	public subscribe(
		event: string,
		subscriber: Subscriber,
		service: ThirdPartyService,
	): void {
		if (!this.subscribers.has(event)) {
			this.subscribers.set(event, new Set<Subscriber>());
		}
		this.subscribers.get(event)?.add(subscriber);
		subscriber.addEvent(event, service);
	}

	// Method to unsubscribe from an event
	public unsubscribe(
		event: string,
		subscriber: Subscriber,
		service: ThirdPartyService,
	): void {
		const logger = Logger.getInstance();

		if (!this.subscribers.has(event)) {
			logger.logError(
				`Trying to unsubscribe from unexisting event: ${event}. Unsubscribe was not executed`,
			);
			return;
		}

		if (!this.subscribers.get(event)?.has(subscriber)) {
			logger.logError(
				`Trying to unsubscribe from unexisting listener: ${subscriber.getName()}. Unsubscribe was not executed`,
			);
			return;
		}

		const subscriberSet = this.subscribers.get(event);

		if (subscriberSet !== undefined) {
			subscriberSet.delete(subscriber);

			if (subscriberSet.size === 0) {
				// If the set is empty, remove the event from the map
				this.subscribers.delete(event);
			}

			subscriber.removeEvent(event, service);

			return;
		}

		logger.log("tried to unsubscribe from undefined subscriber set");
	}

	public notify(message: Message): void {
		const logger = Logger.getInstance();

		if (this.isEmpty(message.event)) {
			logger.log(
				`Notifying for unexisting event: ${message.event}. No notification was sent`,
			);
			return;
		}

		const eventSubscribers = this.subscribers.get(message.event);

		if (eventSubscribers !== undefined) {
			for (const subscriber of eventSubscribers) {
				try {
					subscriber.execute(message);
				} catch (error) {
					Logger.getInstance().logError(`${error}`);
				}
			}
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
}
