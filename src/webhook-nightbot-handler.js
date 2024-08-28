import { AbstractWebhookHandler } from 'webhook-handler-interface.js';
import { SubscriptionService } from './subscription-service';

const express = require('express');

export class NightbotServiceHandler extends AbstractWebhookHandler {
    constructor() {
        this.service = express();
        this.service.post('./webhooks', this.#receive);
        this.subscriptionService = new SubscriptionService();

        this.#bind();
    }
    
    //TODO: Implement authetication logic with Nighbot
    authenticate() {
        
    }

    subscribe(event, subscriber) {
        this.subscriptionService.subscribe(event, subscriber);
    }

    unsubscribe(event, subscriber) {
        this.subscriptionService.unsubscribe(event, subscriber);
    }

    //TODO: Implement receive logic to handle POST requests from nightbot API
    #receive(request, response) {
        //TODO

        this.#notify("event");
    }

    #notify(event) {
        this.subscriptionService.notify(event);
    }

    //TODO: Bind methods to class in this body
    #bind() {

    }
}
