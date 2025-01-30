import { SvelteMap } from "svelte/reactivity";
import client from "$lib/utils/axios";

export class Chat {
    constructor(wsInstance) {
        this.ws = wsInstance;
        this.channels = new SvelteMap();
        this.messages = new SvelteMap();

        this.ws.addListener('chat', (data) => {
            console.log('Chat data:', data);
            if (data.type === 'message') {
                this.handleMessage(data.payload);
            }
        });

        // Store the promise so we know when channels are fully fetched
        this.initPromise = this.initializeChannels();
        console.log('Chat initialized');
    }

    async initializeChannels() {
        const { data } = await client.get('/chat/channels/');
        const fetchPromises = data.channels.map(channel => {
            this.channels.set(channel.id, channel);
            return this.getChannelMessages(channel.id);
        });
        await Promise.all(fetchPromises);
    }

    async getChannelMessages(channelId, limit = 10, offset = 0) {
        const { data } = await client.get(`/chat/channels/${channelId}/messages/`, {
            params: { limit, offset }
        });
        this.messages.set(channelId, data.messages);
    }

    handleMessage(payload) {
        console.log('Handling message:', payload);
        if (this.channels.has(payload.channel_id)) {
            const messages = this.messages.get(payload.channel_id);
            if (messages) {
                console.log('message size before:', messages.length);
                const { id, content, timestamp, user } = payload;
                messages.push({ id, content, timestamp, user });
                messages.sort((a, b) => b.timestamp - a.timestamp);
                console.log('message size after:', messages.length);
            }
        }
    }

    async sendMessage(channelId, content) {
        const x = await client.post(`/chat/messages/create/${channelId}`, { content });
        console.log('Message sent:', x);
    }

    async getFirstChannel() {
        await this.initPromise;
        return this.channels.size ? this.channels.keys().next().value : null;
    }
}
