import { WebhookHandler, SupportedWebhooks } from './base';
import TeamsHandler from './teams';

const createWebhookHandler = (type: SupportedWebhooks, url: string) : WebhookHandler => {
    let handler;
    switch(type){
        case SupportedWebhooks.Teams:
            handler = TeamsHandler
    }

    return new handler(url)
}

export default {
    createWebhookHandler
}