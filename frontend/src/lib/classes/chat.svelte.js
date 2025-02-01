import { SvelteMap } from "svelte/reactivity";
import client from "$lib/utils/axios";
import WS from "$lib/classes/websocket";

const limit = 25;

class Chat {
    instance = null;
    messagesContainer = $state(null);
    selectedChannel = $state(null);
    messages = $state([]);
    channels = $state([]);
    channel = $derived(this.channels.find(channel => channel.id === this.selectedChannel));
    preloaded = $state([]);
    endReached = $state(false);

    constructor() {
        if (this.instance) {
            return this.instance;
        }

        this.ws = WS;

        this.ws.addListener('chat', (data) => {
            console.log('Chat data:', data);
            if (data.type === 'message') {
                this.handleMessage(data.payload);
            }
        });
        this.initPromise = this.initializeChannels();
        console.log('Chat initialized');
    }

    async initializeChannels() {
        try {
            const { data } = await client.get('/chat/channels/');
            const fetchPromises = data.channels.map(channel => {
                this.channels.push(channel);
            });
            await Promise.all(fetchPromises);
            this.selectedChannel = data.channels[0].id;
            await this.getChannelMessages(this.selectedChannel);
        } catch (e) {
            console.error('Failed to initialize channels:', e);
        }
    }

    async getChannelMessages(channelId) {
        if (this.endReached) return;

        const { data } = await client.get(`/chat/channels/${channelId}/messages/`, {
            params: { limit, offset: this.messages.length }
        });
        if (data.messages.length > 0) {
            if (data.messages.length < limit) {
                this.endReached = true;
            }
            for (const message of data.messages) {
                this.messages.unshift(message);
            }
            this.scrollToBottom();
        }
    }

    handleMessage(payload) {
        if (this.selectedChannel === payload.channel_id) {
            this.messages.push(payload);
            this.scrollToBottom();
        }
        const channel = this.channels.find(channel => channel.id === payload.channel_id);
        if (channel) {
            channel.latest_message = payload;
        }
    }

    async sendMessage(content) {
        try {
            await client.post(`/chat/messages/create/${this.selectedChannel}`, { content });
            this.scrollToBottom();
        } catch (e) {
            console.error('Failed to send message:', e);
        }
    }

    async changeChannel(channelId) {
        if (this.selectedChannel === channelId) {
            return;
        }
        this.selectedChannel = channelId;
        this.messages = [];
        this.endReached = false;
        await this.getChannelMessages(channelId);
        this.scrollToBottom();
    }

    scrollToBottom() {
        if (this.messagesContainer && this.messagesContainer.scrollTop !== this.messagesContainer.scrollHeight) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    getInstance() {
        if (!this.instance) {
            this.instance = new Chat();
        }
        return this.instance;
    }
}

const chat = new Chat();
export default chat;
