import { SubscriptionService } from "./subscription-service";
import type { Subscriber } from "./subscriber";
import type { EventHandlerInterface } from "./event-handler-interface";
import type { CommsReceiverInterface } from "./comms-receiver-service-interface";
import type { Message, RequestParser } from "./request-parser-interface";
import type { ThirdPartyService } from "./third-party-service";

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

	public subscribe(
		event: string,
		subscriber: Subscriber,
		service: ThirdPartyService,
	): void {
		this.subscriptionService.subscribe(event, subscriber, service);
	}

	public unsubscribe(
		event: string,
		subscriber: Subscriber,
		service: ThirdPartyService,
	): void {
		this.subscriptionService.unsubscribe(event, subscriber, service);
	}

	public addHandler(
		requestType: string,
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		callback: Function,
		callbackPath?: string,
	): void {
		this.websocket.addHandler(requestType, callback);
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
