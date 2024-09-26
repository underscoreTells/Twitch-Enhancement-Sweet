import type { AuthServiceInterface } from "./auth-service-interface";
import type { EventHandlerInterface } from "./event-handler-interface";
import type { RequestServiceInterface } from "./request-service-interface";
import type { Subscriber } from "./subscriber";

export class ThirdPartyService {
	private authService: AuthServiceInterface;
	private eventHandler: EventHandlerInterface;
	private requestService: RequestServiceInterface;
	private authToken: string;
	private subscriberSecret: string;

	//TODO: Instead of having a bunch of selector methods, implement DI
	constructor(
		authService: AuthServiceInterface,
		eventHandler: EventHandlerInterface,
		requestService: RequestServiceInterface,
	) {
		this.authService = authService;
		this.eventHandler = eventHandler;
		this.eventHandler.setOwningService(this);
		this.requestService = requestService;
		this.authToken = "";
		this.subscriberSecret = "";
	}

	public async authenticate(scope: string, state: string): Promise<void> {
		this.authService.authorize(scope, state);
	}

	public subscribe(
		event: string,
		subscriber: Subscriber,
		secret: string,
	): void {
		this.vistSubscriber(subscriber);

		if (this.subscriberSecret === secret)
			this.eventHandler.subscribe(event, subscriber, this);
	}

	public unsubscribe(
		event: string,
		subscriber: Subscriber,
		secret: string,
	): void {
		this.vistSubscriber(subscriber);

		if (this.subscriberSecret === secret)
			this.eventHandler.unsubscribe(event, subscriber, this);
	}

	public request(): void {}

	public async receiveAuthCode(code: string): Promise<void> {
		const authToken = await this.authService.getAccessToken(code);

		if (authToken === null)
			throw new Error("Auth Token not received. Received null instead");

		this.authToken = authToken;
	}

	public receiveSecret(secret: string): void {
		this.subscriberSecret = secret;
	}

	private vistSubscriber(subscriber: Subscriber): void {
		subscriber.acceptVisitor(this);
	}
}
