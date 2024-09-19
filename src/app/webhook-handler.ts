import type { EventHandlerInterface } from "./event-handler-interface";
import { type Subscriber, SubscriptionService } from "./subscription-service";
import type { Request, Response, Application } from "express";
import { Logger } from "./logger";
import type { CommsReceiverInterface } from "./comms-receiver-service-interface";
import type { RequestParser } from "./request-parser-interface";

export class WebhookHandler implements EventHandlerInterface {
	private server: CommsReceiverInterface;
	private subscriptionService: SubscriptionService;
	private callbackPath: string;
	private parser: RequestParser;

	constructor(
		expressApp: CommsReceiverInterface,
		callbackPath: string,
		parser: RequestParser,
	) {
		this.server = expressApp;
		this.subscriptionService = new SubscriptionService();
		this.parser = parser;
		this.callbackPath = callbackPath;

		this.receive = this.receive.bind(this);
		this.server.addHandler("post", this.receive, `${this.callbackPath}/`);
	}

	subscribe(event: string, subscriber: Subscriber): void {
		this.subscriptionService.subscribe(event, subscriber);
	}

	unsubscribe(event: string, subscriber: Subscriber): void {
		this.subscriptionService.unsubscribe(event, subscriber);
	}

	//TODO: Implement receive logic to handle POST requests from service API
	private receive(request: Request, response: Response): void {
		const message = this.parser.getEventBody(request);

		if (message.event === "")
			throw new Error("Empty event in message received in webhook");

		this.notify(this.parser.getEventBody(request).event);
		response
			.status(200)
			.send("Messaged received and subscriber services notified");
	}

	private notify(event: string): void {
		this.subscriptionService.notify(event);
	}
}
