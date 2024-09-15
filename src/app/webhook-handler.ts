import type { EventHandlerInterface } from "./event-handler-interface";
import { type Subscriber, SubscriptionService } from "./subscription-service";
import type { Request, Response, Application } from "express";
import { Logger } from "./logger";
import type { CommsReceiverInterface } from "./comms-receiver-service-interface";

export class WebhookHandler implements EventHandlerInterface {
	private server: CommsReceiverInterface;
	private subscriptionService: SubscriptionService;
	private callbackPath: string;

	constructor(expressApp: CommsReceiverInterface, callbackPath: string) {
		this.server = expressApp;
		this.subscriptionService = new SubscriptionService();
		this.callbackPath = callbackPath;

		this.receive = this.receive.bind(this);
		this.server.addHandler("post", this.receive, `${callbackPath}/`);
	}

	subscribe(event: string, subscriber: Subscriber): void {
		this.subscriptionService.subscribe(event, subscriber);
	}

	unsubscribe(event: string, subscriber: Subscriber): void {
		this.subscriptionService.unsubscribe(event, subscriber);
	}

	//TODO: Implement receive logic to handle POST requests from service API
	private receive(request: Request, response: Response): void {
		//TODO

		this.notify("event");
	}

	private notify(event: string): void {
		this.subscriptionService.notify(event);
	}
}
