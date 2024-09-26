import type { Subscriber } from "./subscriber";
import type { ThirdPartyService } from "./third-party-service";

export interface EventHandlerInterface {
	subscribe(
		event: string,
		subscriber: Subscriber,
		service: ThirdPartyService,
	): void;
	unsubscribe(
		event: string,
		subscriber: Subscriber,
		service: ThirdPartyService,
	): void;
	setOwningService(service: ThirdPartyService): void;
}
