import type { WebhookInterface } from "./webhook-handler-interface";
import { type Subscriber, SubscriptionService } from "./subscription-service";
import { OAuth2AuthService } from "./oauth2-auth-service";
import type { Request, Response, Application } from "express";
import { Logger } from "./logger";
import {
	nightbotClientID,
	nightbotClientSecret,
	nightbotTokenURL,
	nightbotRedirectURL,
} from "../utils/constants";

export class NightbotServiceHandler implements WebhookInterface {
	private server: Application;
	private subscriptionService: SubscriptionService;
	private authService: OAuth2AuthService;
	private commandToken: string | null = null;

	constructor(expressApp: Application) {
		this.bind();

		this.server = expressApp;
		this.subscriptionService = new SubscriptionService();

		this.server.post("/nightbot-webhooks", this.receive);

		this.newAuthService();
	}

	//TODO: Implement authetication logic with Nighbot
	async authenticate(): Promise<void> {
		try {
			this.commandToken = await this.authService.getAccessToken("commands");
		} catch (error) {
			const logger = Logger.getInstance();
			logger.log("authentication error for nightbot"); // TODO: Log error info
		}
	}

	subscribe(event: string, subscriber: Subscriber): void {
		this.subscriptionService.subscribe(event, subscriber);
	}

	unsubscribe(event: string, subscriber: Subscriber): void {
		this.subscriptionService.unsubscribe(event, subscriber);
	}

	//TODO: Implement receive logic to handle POST requests from nightbot API
	private receive(request: Request, response: Response): void {
		//TODO

		this.notify("event");
	}

	private notify(event: string): void {
		this.subscriptionService.notify(event);
	}

	//Create new auth service - declutters constructor
	private newAuthService(): void {
		this.authService = new OAuth2AuthService(
			nightbotClientID,
			nightbotClientSecret,
			nightbotTokenURL,
			nightbotRedirectURL,
		);
	}

	//TODO: Bind methods to class in this body
	private bind(): void {
		this.authenticate = this.authenticate.bind(this);
		this.subscribe = this.subscribe.bind(this);
		this.unsubscribe = this.unsubscribe.bind(this);
		this.receive = this.receive.bind(this);
		this.notify = this.notify.bind(this);
		this.newAuthService = this.newAuthService.bind(this);
	}
}