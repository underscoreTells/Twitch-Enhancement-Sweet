import { AbstractWebhookHandler } from 'webhook-handler-interface.js';
import { Logger } from './logger';

const express = require('express');

export class NightbotServiceHandler extends AbstractWebhookHandler {
    constructor() {
        this.service = express();
        this.service.post('./webhooks', this.#receive);
        this.subscribers = new map();

        this.#bind();
    }
    
    authenticate() {
        
    }

    subscribe(event, subscriber) {
        if (!this.subscribers.has(event))
            this.subscribers.set(event, new set());

        this.subscribers.get(event).add(subscriber);
    }

    unsubscribe(event, subscriber) {
        const logger = new Logger();

        if (!this.subscribers.has(event)) {
            logger.log(`trying to unsubscribe for unexisting event: ${event}. unsubscribe was not executed`);

            return;
        }

        if (!this.subscribers.get(event).has(subscriber)) {
            logger.log(`trying to unsubscribe for unexisting listener: ${subscriber.name()}. unsubscribe was not executed`);

            return;
        }

        this.subscribers.get(event).delete(subscriber);
    }

    //TODO: Implement receive logic to handle POST requests from nightbot API
    #receive(request, response) {

    }

    #notify(event) {
        if (this.#isEmpty(event)) {
            const logger = new Logger();

            logger.log(`notifying for unexisting event: ${event}. No notification was sent`);
            return;
        }

        const eventSubscribers = this.subscribers.get(event);

        eventSubscribers.forEach(subscriber => {
            subscriber.execute();
        });
    }

    #isEmpty(event) {
        const eventSubscribers = this.subscribers.get(event);

        return (
            eventSubscribers === null || eventSubscribers === undefined || (Array.isArray(value) && value.length === 0)
        );
    }

    //TODO: Bind methods to class in this body
    #bind() {

    }
}
