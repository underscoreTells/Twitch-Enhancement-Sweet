export class WebhookInterface {
    authenticate() {
        throw new Error("Method 'authenticate()' must be implemented.");
    }

    subscribe() {
        throw new Error("Method 'subscribe()' must be implemented.");
    }

    unsubscribe() {
        throw new Error("Method 'unsubscribe()' must be implemented.");
    }
}
