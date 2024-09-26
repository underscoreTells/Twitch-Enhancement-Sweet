import { type RequestParser, Message } from "./request-parser-interface";

export class NightbotParser implements RequestParser {
	private eventRecord: Record<string, (data: string) => Message>;

	constructor() {
		this.eventRecord = {
			session_welcome: this.sessionWelcome,
			session_keepalive: this.keepAliveMessage,
			revocation: this.revocation,
			notification: this.notification,
		};
	}

	getEventBody(data: string): Message {
		const returnFunction =
			this.eventRecord[JSON.parse(data).metadata.message_type];

		return returnFunction(data);
	}

	//Following method is only valid for some messages. Notification messages should not result in a call to this method
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private prepObject(data: string): [any, Message] {
		const jsonObject = JSON.parse(data);
		const message = new Message();

		message.event = jsonObject.metadata.message_type;

		return [jsonObject, message];
	}

	private sessionWelcome(data: string): Message {
		const jsonObject = this.prepObject(data)[0];
		const message = this.prepObject(data)[1];

		message.time = new Date(
			jsonObject.payload.session.connected_at,
		).toTimeString();
		message.keepaliveTimeout =
			jsonObject.payload.session.keepalive_timeout_seconds;

		return message;
	}

	private keepAliveMessage(data: string): Message {
		return this.prepObject(data)[1];
	}

	private revocation(data: string): Message {
		const jsonObject = this.prepObject(data)[0];
		const message = this.prepObject(data)[1];

		message.time = new Date(
			jsonObject.payload.session.connected_at,
		).toTimeString();

		message.subscriptionType = jsonObject.payload.subscription.type;

		return message;
	}

	private notification(data: string): Message {
		const jsonObject = JSON.parse(data);
		const message = new Message();

		message.event = jsonObject.payload.subscription.type;
		message.user_login = jsonObject.payload.event.chatter_user_login;
		message.user_name = jsonObject.payload.event.chatter_user_name;
		message.message = jsonObject.payload.event.message.text;
		return message;
	}
}
