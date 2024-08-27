import { WebhookInterface } from 'webhook-handler-interface.js';

const express = require('express');

export class AbstractWebhookHandler extends WebhookInterface {
    constructor() {
        if (new.target === AbstractWebhookHandler) {
            throw new TypeError("Cannot instantiate an abstract class directly.");
        }

        this.app =express();
        this.app.use(express.json());
        this.app.post('/webhook', this.receive);
    }

    validate() {
        return data && data.hasOwnProperty('event');
    }

    verify() {
        return true; // Implement signature or token verification logic here
    }

    processEvent(data) {
        try {
            if (this._isDuplicate(data.id)) {
                this._logEvent('Duplicate event received', 'warn');
                return;
            }

            this._logEvent(`Processing event: ${data.event}`, 'info');
            // Implement event processing logic here
        } catch (error) {
            this._handleError(error);
        }
    }

    respond(res, status, message) {
        res.status(status).json({ message });
    }

    #receive(req, resp) {
        this.request = req;
        this.response = resp;
    }


    // Private method for idempotency check
    #isDuplicate(eventId) {
        // Implement logic to check if the event has already been processed
        return false;
    }

    // Private method for internal logging
    #logEvent(message, level = 'info') {
        console.log(`[${level.toUpperCase()}]: ${message}`);
    }

    // Private method for internal error handling
    #handleError(error) {
        this._logEvent(`Error: ${error.message}`, 'error');
        // Additional error handling logic
    }
}
