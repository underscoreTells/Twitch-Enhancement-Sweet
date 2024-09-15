import { type Subscriber, SubscriptionService } from "./subscription-service";
import type { EventHandlerInterface } from "./event-handler-interface";
import type { CommsReceiverInterface } from "./comms-receiver-service-interface";
import type { HttpRequestService } from "./http-request-service";

export class WebsocketHandler
	implements EventHandlerInterface, HttpRequestService
{
	private subscriptionService: SubscriptionService;
	private websocket: CommsReceiverInterface;

	constructor(websocket: CommsReceiverInterface) {
		this.subscriptionService = new SubscriptionService();
		this.websocket = websocket;
	}

	subscribe(event: string, subscriber: Subscriber): void {
		//TODO
	}

	unsubscribe(event: string, subscriber: Subscriber): void {
		//TODO
	}
}
