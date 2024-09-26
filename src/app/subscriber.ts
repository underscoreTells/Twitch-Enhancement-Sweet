import type { ThirdPartyService } from "./third-party-service";
import type { Message } from "./request-parser-interface";
import type { FileWorkerManagerPool } from "./file-worker-manager-pool";
import { v4 as uuidv4 } from "uuid";
import { FileIO } from "./file-io";

export class Subscriber extends FileIO {
	private name: string;
	private subscribedEvents: Map<ThirdPartyService, Map<string, boolean>>;
	private secret: string;
	private subscriberFunction: (
		message: Message,
		subscriberObject: Subscriber,
	) => void;

	constructor(
		name: string,
		filePool: FileWorkerManagerPool,
		execute: (message: Message, subscriberObject: Subscriber) => void,
	) {
		super();
		this.name = name;
		this.subscribedEvents = new Map();
		this.secret = uuidv4();
		this.subscriberFunction = execute;
	}

	public execute(message: Message): void {
		this.subscriberFunction(message, this);
	}

	public getName() {
		return this.name;
	}

	public acceptVisitor(service: ThirdPartyService): void {
		service.receiveSecret(this.secret);
	}

	public addEvent(event: string, service: ThirdPartyService) {
		if (this.subscribedEvents.get(service) === undefined)
			this.subscribedEvents.set(service, new Map());

		const subscribedEvents = this.subscribedEvents.get(service);

		if (
			subscribedEvents !== undefined &&
			subscribedEvents.get(event) !== undefined
		)
			this.subscribedEvents.get(service)?.set(event, true);
	}

	public removeEvent(event: string, service: ThirdPartyService) {
		const subscribedEvents = this.subscribedEvents.get(service);

		if (subscribedEvents === undefined) return;

		if (subscribedEvents.size === 0) this.subscribedEvents.delete(service);

		subscribedEvents.delete(event);
	}

	public setSubsciberFunction(
		execute: (message: Message, subscriberObject: Subscriber) => void,
	): void {
		this.subscriberFunction = execute;
	}

	public disableEvent(event: string, service: ThirdPartyService): void {
		const eventMap = this.subscribedEvents.get(service);
		if (eventMap !== undefined) {
			eventMap.set(event, false);
			this.unsubscribe(event, service);
		}
	}

	public enableEvent(event: string, service: ThirdPartyService): void {
		const eventMap = this.subscribedEvents.get(service);
		if (eventMap !== undefined) {
			eventMap.set(event, true);
			this.subscribe(event, service);

			return;
		}

		this.addEvent(event, service);
	}

	public disable(): void {
		this.subscribedEvents.forEach(
			(events: Map<string, boolean>, service: ThirdPartyService) => {
				for (const event of events) this.disableEvent(event[0], service);
			},
		);
	}

	public enable(): void {
		this.subscribedEvents.forEach(
			(events: Map<string, boolean>, service: ThirdPartyService) => {
				for (const event of events) this.enableEvent(event[0], service);
			},
		);
	}

	private subscribe(event: string, service: ThirdPartyService): void {
		const secret = uuidv4();
		this.secret = secret;
		service.subscribe(event, this, secret);
	}

	private unsubscribe(event: string, service: ThirdPartyService): void {
		const secret = uuidv4();
		this.secret = secret;
		service.unsubscribe(event, this, secret);
	}
}
