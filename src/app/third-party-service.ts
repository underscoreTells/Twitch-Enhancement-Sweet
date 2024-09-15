import type { AuthServiceInterface } from "./auth-service-interface";
import type { EventHandlerInterface } from "./event-handler-interface";
import type { RequestServiceInterface } from "./request-service-interface";
import { OAuth2AuthService } from "./oauth2-auth-service";

export class ThirdPartyService {
	private authService: AuthServiceInterface;
	private eventHandler: EventHandlerInterface;
	private requestService: RequestServiceInterface;

	//TODO: Instead of having a bunch of selector methods, implement DI
	constructor(
		authService: AuthServiceInterface,
		eventHandler: EventHandlerInterface,
		requestService: RequestServiceInterface,
	) {
		this.authService = authService;
		this.eventHandler = eventHandler;
		this.requestService = requestService;
	}

	authenticate(): void {}
}
