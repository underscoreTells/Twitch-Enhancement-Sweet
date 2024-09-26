import type { Request } from "express";

export class Message {
	constructor(
		public event = "",
		public user_login = "",
		public user_name = "",
		public time = "",
		public message = "",
		public subscriptionType = "",
		public keepaliveTimeout = 0,
		public code = "",
	) {}
}

export interface RequestParser {
	getEventBody(data: Request | string): Message;
	getAuthCode(data: Request | string): Message;
}
