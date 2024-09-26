import type { Request } from "express";
import { type RequestParser, Message } from "./request-parser-interface";

export class NightbotParser implements RequestParser {
	public getEventBody(data: Request): Message {
		const message = new Message();

		message.event = data.query.message as string;
		message.time = data.query.time as string;
		message.user_login = data.query.user_login as string;
		message.user_name = data.query.user_name as string;

		return message;
	}

	public getAuthCode(data: Request): Message {
		const message = new Message();

		message.event = "nightbot_auth_code";
		message.code = data.query.code as string;

		return message;
	}
}
