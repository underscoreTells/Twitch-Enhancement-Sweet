import { AbstractWebhookHandler } from 'webhook-abstract-handler.js';

export class NightbotServiceHandler extends AbstractWebhookHandler {

    constructor() {
        super();
    }

    parseRequest(req) {
        throw new Error('Method "parseRequest()" must be implemented.');
    }

    validate(data) {
        if (!data || !data.type) {
            throw new Error('Invalid webhook data');
        }
    }

    verify(req) {
        throw new Error('Method "verify()" must be implemented.');
    }

    processEvent(data) {
        throw new Error('Method "processEvent()" must be implemented.');
    }

    respond(res, status, message) {
        throw new Error('Method "respond()" must be implemented.');
    }
}
