import type { Request } from "express";

export class Message {
	public event: string;
	public user: string;
	public time: string;
	public message: string;

	constructor() {
		this.event = "";
		this.user = "";
		this.time = "";
		this.message = "";
	}
}

export interface RequestParser {
	getEventBody(data: Request | string): Message;
}
