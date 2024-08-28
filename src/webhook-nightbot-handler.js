import { AbstractWebhookHandler } from 'webhook-handler-interface.js';
import { SubscriptionService } from './subscription-service';
import { OAuth2AuthService } from './oauth2-auth-service';
import {nightbotClientID, nightbotClientSecret, nightbotRedirectURL, nightbotTokenURL} from '../utils/constants'

const express = require('express');

export class NightbotServiceHandler extends AbstractWebhookHandler {
    constructor() {
        this.service = express();
        this.service.post('./webhooks', this.#receive);
        this.subscriptionService = new SubscriptionService();
        
        this.#newAuthService();
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

    //Method to instantiate a new auth service - declutters constructor
    #newAuthService() {
        this.authService = new OAuth2AuthService({
            clientId: nightbotClientID,
            clientSecret: nightbotClientSecret,
            tokenUrl: nightbotTokenURL,
            redirectUri: nightbotRedirectURL,
            scope: 'your-required-scope',
        });
    }
}
