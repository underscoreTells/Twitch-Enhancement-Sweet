import type { Request } from "express";
import { type RequestParser, Message } from "./request-parser-interface";

export class NightbotParser implements RequestParser {
	getEventBody(data: Request): Message {
		const message = new Message();

		message.event = data.query.message as string;
		message.time = data.query.time as string;
		message.user = data.query.user as string;

		return message;
	}
}
