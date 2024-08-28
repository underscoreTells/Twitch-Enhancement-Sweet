import { Logger } from "./logger";

export class SubscriptionService {
    constructor() {
        this.subscribers = new Map();
    }

    subscribe(event, subscriber) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event).add(subscriber);
    }

    // Method to unsubscribe from an event
    unsubscribe(event, subscriber) {
        const logger = new Logger();

        if (!this.subscribers.has(event)) {
            logger.log(`trying to unsubscribe for unexisting event: ${event}. unsubscribe was not executed`);

            return;
        }

        if (!this.subscribers.get(event).has(subscriber)) {
            logger.log(`trying to unsubscribe for unexisting listener: ${subscriber.name()}. unsubscribe was not executed`);

            return;
        }

        let subscriberSet = this.subscribers.get(event);
        subscriberSet.delete(subscriber);

        // If the set is empty, remove the event from the map
        if (subscriberSet.size === 0) {
            this.subscribers.delete(event);
        }
        
    }

    notify(event) {
        if (this.#isEmpty(event)) {
            const logger = new Logger();

            logger.log(`notifying for unexisting event: ${event}. No notification was sent`);
            return;
        }

        const eventSubscribers = this.subscribers.get(event);

        eventSubscribers.forEach(subscriber => {
            subscriber.execute();
        });
    }

    #isEmpty(event) {
        const eventSubscribers = this.subscribers.get(event);

        return (
            eventSubscribers === null || eventSubscribers === undefined || (Array.isArray(value) && value.length === 0)
        );
    }
}