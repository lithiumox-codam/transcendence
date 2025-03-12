import type { UserClass } from "$lib/classes/User.svelte";
import { client } from "$lib/trpc";
import type { Message, User } from "@repo/database";
import { tick } from "svelte";
import { SvelteMap } from "svelte/reactivity";

export class Chat {
    messages = new SvelteMap<number, Message[]>();
    messagesContainer = $state<HTMLElement | null>(null);
    selectedFriend = $state<number | null>(null);
    loadMoreTrigger = $state<HTMLElement | null>(null);
    endReached = $state(false);

    constructor(private userClass: UserClass) {
        this.initialize();
    }

    private async initialize() {
        try {
            // Wait until user data is loaded
            while (this.userClass.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (!this.userClass.data) {
                throw new Error("User not found");
            }

            await Promise.all(
                this.userClass.friends.map(async (friend) => {
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

            this.listenMessages();

            if (this.userClass.friends.length > 0) {
                this.selectedFriend = this.userClass.friends[0].id;
                await tick();
                this.scrollDown();
            }
            this.observeLoadMoreTrigger();
        } catch (e) {
            console.error(e);
        }
    }

    private async listenMessages(): Promise<void> {
        client.chat.listen.subscribe(undefined, {
            onData: async ({ data, type }) => {
                const otherUserId = this.userClass.data?.id === data.senderId 
                    ? data.receiverId 
                    : data.senderId;
                    
                const messages = this.messages.get(otherUserId);
                if (!messages) return;

                switch (type) {
                    case "message": {
                        messages.push(data);
                        await tick();
                        this.scrollDown();
                        break;
                    }
                    case "removal": {
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
