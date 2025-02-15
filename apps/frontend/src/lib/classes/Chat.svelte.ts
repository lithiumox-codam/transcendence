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
            // Fetch list of friends
            this.friends = await client.user.friends.list.query();

            // For each friend, load chat messages
            await Promise.all(
                this.friends.map(async (friend) => {
                    try {
                        const msgs = await client.chat.get.query({
                            friendId: friend.id,
                            limit: 20,
                            offset: 0,
                        });
                        // Wrap messages in $state for reactivity
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

            // Select the first friend by default (if available)
            if (this.friends.length > 0) {
                this.selectedFriend = this.friends[0].id;
                await tick(); // Wait for DOM updates
                this.scrollDown();
            }
            this.observeLoadMoreTrigger();
        } catch (e) {
            console.error(e);
        }
    }

    private async listenFriends(): Promise<void> {
        // Assuming there is a friends.listen subscription on the user endpoint
        client.user.friends.listen.subscribe(undefined, {
            onData: ({ data }) => {
                switch (data.type) {
                }
            },
        });
    }

    private async listenMessages(): Promise<void> {
        client.chat.listen.subscribe(undefined, {
            onData: async ({ data }) => {
                switch (data.type) {
                    case "new":
                        {
                            const user =
                                data.message.senderId === this.user?.id
                                    ? data.message.receiverId
                                    : data.message.senderId;
                            const messages = this.messages.get(user);
                            if (messages) {
                                messages.push(data.message);
                                await tick();
                                this.scrollDown();
                            }
                        }
                        break;
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
        if (!messages) {
            return;
        }
        const res = await client.chat.get.query({
            friendId: this.selectedFriend,
            limit: 20,
            offset: messages.length,
        });
        if (res) {
            messages.unshift(...res);
        }
    }
}
