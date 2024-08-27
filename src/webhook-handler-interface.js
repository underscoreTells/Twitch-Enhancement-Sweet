export class WebhookInterface {
    parseRequest(req) {
        throw new Error('Method "parseRequest()" must be implemented.');
    }

    validate(data) {
        throw new Error('Method "validate()" must be implemented.');
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
