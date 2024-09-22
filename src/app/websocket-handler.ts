import { type Subscriber, SubscriptionService } from "./subscription-service";
import type { EventHandlerInterface } from "./event-handler-interface";
import type { CommsReceiverInterface } from "./comms-receiver-service-interface";
import type { Message, RequestParser } from "./request-parser-interface";

export class WebsocketHandler implements EventHandlerInterface {
	private subscriptionService: SubscriptionService;
	private websocket: CommsReceiverInterface;
	private parser: RequestParser;

	constructor(websocket: CommsReceiverInterface, parser: RequestParser) {
		this.subscriptionService = new SubscriptionService();
		this.websocket = websocket;
		this.parser = parser;

		this.receive = this.receive.bind(this);
		this.websocket.addHandler("message", this.receive);
	}

	public subscribe(event: string, subscriber: Subscriber): void {
		this.subscriptionService.subscribe(event, subscriber);
	}

	public unsubscribe(event: string, subscriber: Subscriber): void {
		this.subscriptionService.unsubscribe(event, subscriber);
	}

	private receive(data: string): void {
		const message = this.parser.getEventBody(data);

		if (message.event === "")
			throw new Error("Empty event in message received in webhook");

		this.notify(message);
	}

	private notify(message: Message): void {
		this.subscriptionService.notify(message);
	}
}
