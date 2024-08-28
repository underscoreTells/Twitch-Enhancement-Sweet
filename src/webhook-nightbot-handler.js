import { WebhookInterface } from 'webhook-handler-interface.js';
import { SubscriptionService } from './subscription-service';

export class NightbotServiceHandler extends WebhookInterface {
    constructor(expressApp, authService) {
        this.server = expressApp;
        this.authService = authService;
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
