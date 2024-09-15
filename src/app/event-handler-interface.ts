import type { Subscriber } from "./subscription-service";

export interface EventHandlerInterface {
	subscribe(event: string, subscriber: Subscriber): void;
	unsubscribe(event: string, subscriber: Subscriber): void;
}
