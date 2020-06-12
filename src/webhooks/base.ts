export enum SupportedWebhooks {
    Teams = 'teams'
}

export interface StringKeyValueObject {
    [key: string]: string
}

export interface WebhookHandler {
    url: string
    send : (title: string, content: string, metadata: StringKeyValueObject ) => Promise<void>
}