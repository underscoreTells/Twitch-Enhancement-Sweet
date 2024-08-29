import type { Subscriber } from "./subscription-service";

export interface WebhookInterface {
	authenticate(): void;
	subscribe(event: string, subscriber: Subscriber): void;
	unsubscribe(event: string, subscriber: Subscriber): void;
}
