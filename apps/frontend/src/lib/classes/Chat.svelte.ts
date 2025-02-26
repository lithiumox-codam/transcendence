import { client } from "$lib/trpc";
import type { Message, User } from "@repo/database";
import { tick } from "svelte";
import { SvelteMap } from "svelte/reactivity";

export class Chat {
    user = $state<User>();
    friends = $state<User[]>([]);
    messages = new SvelteMap<number, Message[]>();
    messagesContainer: HTMLElement | null = $state(null);
    selectedFriend: number | null = $state(null);
    loadMoreTrigger: HTMLElement | null = $state(null);
    endReached = $state(false);

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            const res = await client.user.get.query();
            if (!res) {
                throw new Error("User not found");
            }
            this.user = res[0];

            this.friends = await client.user.friends.list.query();

            await Promise.all(
                this.friends.map(async (friend) => {
                    try {
                        const msgs = await client.chat.get.query({
                            friendId: friend.id,
                            limit: 20,
                            offset: 0,
                        });
                        msgs.reverse();
                        const temp = $state(msgs);
                        this.messages.set(friend.id, temp);
                    } catch (e) {
                        console.error(e);
                    }
                }),
            );

            this.listenFriends();
            this.listenMessages();

            if (this.friends.length > 0) {
                this.selectedFriend = this.friends[0].id;
                await tick();
                this.scrollDown();
            }
            this.observeLoadMoreTrigger();
        } catch (e) {
            console.error(e);
        }
    }

    private async listenFriends(): Promise<void> {
        client.user.friends.listen.subscribe(undefined, {
            onData: ({ data, type }) => {
                // TODO: Handle friend added/removed
            },
        });
    }

    private async listenMessages(): Promise<void> {
        client.chat.listen.subscribe(undefined, {
            onData: async ({ data, type }) => {
                const messages = this.messages.get(data.receiverId);
                if (!messages) return;

                switch (type) {
                    case "messageCreated": {
                        messages.push(data);
                        await tick();
                        this.scrollDown();
                        break;
                    }
                    case "messageDeleted": {
                        const index = messages.findIndex((msg) => msg.id === data.id);
                        if (index !== -1) {
                            messages.splice(index, 1);
                            await tick();
                        }
                        break;
                    }
                }
            },
        });
    }

    private async scrollDown() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop =
                this.messagesContainer.scrollHeight;
        }
    }

    private observeLoadMoreTrigger() {
        if (!this.loadMoreTrigger) return;
        const observer = new IntersectionObserver(
            async ([entry]) => {
                if (entry.isIntersecting) {
                    await this.loadMoreMessages();
                }
            },
            { root: this.messagesContainer, threshold: 0.1 },
        );
        observer.observe(this.loadMoreTrigger);
    }

    async loadMoreMessages() {
        if (!this.selectedFriend) {
            return;
        }
        const messages = this.messages.get(this.selectedFriend);
        if (!messages) return;

        const container = this.messagesContainer;
        if (!container) return;

        const prevScrollHeight = container.scrollHeight;
        const prevScrollTop = container.scrollTop;

        const res = await client.chat.get.query({
            friendId: this.selectedFriend,
            limit: 20,
            offset: messages.length,
        });

        if (res.length > 0) {
            messages.unshift(...res);
            if (res.length < 20) this.endReached = true;
            await tick();
            const newScrollHeight = container.scrollHeight;
            const heightDifference = newScrollHeight - prevScrollHeight;
            container.scrollTop = prevScrollTop + heightDifference;
        }
    }
}
