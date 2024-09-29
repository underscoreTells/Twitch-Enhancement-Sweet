import type {
	AuthServiceInterface,
	ServiceInfo,
} from "./auth-service-interface";
import type { EventHandlerInterface } from "./event-handler-interface";
import type { RequestServiceInterface } from "./request-service-interface";
import type { Subscriber } from "./subscriber";

export class ThirdPartyService {
	private authService: AuthServiceInterface;
	private eventHandler: EventHandlerInterface;
	private requestService: RequestServiceInterface;
	private service: ServiceInfo;
	private subscriberSecret: string;

	constructor(
		authService: AuthServiceInterface,
		eventHandler: EventHandlerInterface,
		requestService: RequestServiceInterface,
		service: ServiceInfo,
	) {
		this.authService = authService;
		this.eventHandler = eventHandler;
		this.requestService = requestService;
		this.service = service;
		this.subscriberSecret = "";
	}

	public async authenticate(scope: string, state: string): Promise<void> {
		if (this.service.accessToken === null) {
			const code = await this.authService.authorize(scope, state);
			if (code === undefined || code === null)
				throw new Error("undefined auth code received");

			if (code === "access_denied")
				throw new Error("access denied when trying to get auth code");

			const service = await this.authService.getAccessToken(code);

			if (service !== null) this.service = service;
			else throw new Error("Received null auth token from auth service");
		}

		if (
			this.service.tokenExpiresIn !== null &&
			this.authService.isTokenExpired()
		)
			await this.authService.refreshAccessToken();
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

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	public async request(methodArguments: Record<string, any>): Promise<void> {
		if (this.service.accessToken === "")
			throw new Error(
				`${this.service.serviceName} is not authenticated. Make sure to authenticate beofre making requests`,
			);

		if (this.authService.isTokenExpired())
			await this.authService.refreshAccessToken();

		methodArguments.headers = {
			...methodArguments.headers,
			Authorization: `Bearer ${this.service.accessToken}`,
		};

		this.requestService.sendRequest(methodArguments);
	}

	public receiveSecret(secret: string): void {
		this.subscriberSecret = secret;
	}

	private vistSubscriber(subscriber: Subscriber): void {
		subscriber.acceptVisitor(this);
	}
}
