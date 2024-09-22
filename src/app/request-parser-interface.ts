import type { Request } from "express";

export class Message {
	public event: string;
	public user_login: string;
	public user_name: string;
	public time: string;
	public message: string;
	public subscriptionType: string;
	public keepaliveTimeout: number;

	constructor() {
		this.event = "";
		this.user_login = "";
		this.user_name = "";
		this.time = "";
		this.message = "";
		this.subscriptionType = "";
		this.keepaliveTimeout = 0;
	}
}

export interface RequestParser {
	getEventBody(data: Request | string): Message;
}
