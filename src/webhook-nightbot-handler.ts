import { WebhookInterface } from 'webhook-handler-interface.js';
import { SubscriptionService } from './subscription-service';
import { OAuth2AuthService } from './oauth2-auth-service';
import { nighbotClientID, nightbotClientSecret, nightbotTokenURL, nightbotRedirectURL } from '../utils/constants'
import { Logger } from './logger';

export class NightbotServiceHandler extends WebhookInterface {
    constructor(expressApp) {
        this.server = expressApp;
        this.subscriptionService = new SubscriptionService();

        this.server.post('./nightbot-webhooks', this.#receive(req, res));
        
        this.#newAuthService();
        this.#bind();
    }
    
    //TODO: Implement authetication logic with Nighbot
    async authenticate() {
        try {
            this.commandToken = await this.authService.getAccessToken('commands');
        }

        catch (error) {
            const logger = new Logger();

            logger.log('authentication error for nightbot'); //TODO: Log error info
        }
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

    //Create new auth service - declutters constructor
    #newAuthService() {
        this.authService = new OAuth2AuthService({
            clientId: nighbotClientID,
            clientSecret: nightbotClientSecret,
            tokenUrl: nightbotTokenURL,
            redirectUri: nightbotRedirectURL,
        });
    }

    //TODO: Bind methods to class in this body
    #bind() {

    }
}
