import { WebhookHandler, StringKeyValueObject } from './base';
import axios from 'axios';

interface Fact {
    name: string
    value: string
}

class TeamsWebsocketHandler implements WebhookHandler {
    url: string
    constructor(url: string){
        this.url = url;
    }
    async send(title: string, content: string, metadata: StringKeyValueObject){

        const facts : Fact[] = Object.entries(metadata).map(([name, value]) => ({ name, value }))

        await axios.post(this.url,{
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": "123BE5",
            "summary": title,
            "sections": [{
                "activityTitle": title,
                "activitySubtitle": "",
                "facts": facts,
                "markdown": true
            }]
        })
    }
}

export default TeamsWebsocketHandler