import type { EventHandlerInterface } from "./event-handler-interface";
import { SubscriptionService } from "./subscription-service";
import type { Request, Response, Application } from "express";
import { Logger } from "./logger";
import type { CommsReceiverInterface } from "./comms-receiver-service-interface";
import type { Message, RequestParser } from "./request-parser-interface";
import type { ThirdPartyService } from "./third-party-service";
import type { Subscriber } from "./subscriber";

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
		this.server.addHandler("POST", this.receive, `${this.callbackPath}/`);
		this.server.addHandler(
			"GET",
			this.receiveAuth,
			`${this.callbackPath}/auth`,
		);
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

	private receive(request: Request, response: Response): void {
		const message = this.parser.getEventBody(request);

		if (message.event === "")
			throw new Error("Empty event in message received in webhook");

		this.notify(message);
		response
			.status(200)
			.send("Messaged received and subscriber services notified");
	}

	private receiveAuth(request: Request, response: Response): void {
		const message = this.parser.getAuthCode(request);

		if (message.event === "")
			throw new Error("Empty event in message received in webhook");

		this.notify(message);
		response
			.status(200)
			.send("Messaged received and subscriber services notified");
	}

	private notify(message: Message): void {
		this.subscriptionService.notify(message);
	}
}
