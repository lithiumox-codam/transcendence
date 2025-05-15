import type { UserClass } from "$lib/classes/User.svelte";
import { client } from "$lib/trpc";
import type { Message, User } from "@repo/database/types";
import { tick } from "svelte";
import { SvelteMap } from "svelte/reactivity";

export class Chat {
    messages = new SvelteMap<number, Message[]>();
    messagesContainer = $state<HTMLElement | null>(null);
    selectedFriend = $state<number | null>(null);
    loadMoreTrigger = $state<HTMLElement | null>(null);
    endReached = $state(false);
    observer = $state<IntersectionObserver | null>(null);

    constructor(private userClass: UserClass) {
        this.initialize();
    }

    private async initialize() {
        try {
            // Wait until user data is loaded
            while (this.userClass.isLoading) {
                await new Promise((resolve) => setTimeout(resolve, 100));
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
        } catch (e) {
            console.error(e);
        }
    }

	private getMessages(friendId: number): Message[] | undefined {
		if (!this.messages.has(friendId)) {
			const tmp = $state<Message[]>([]);
			this.messages.set(friendId, tmp);
			return this.messages.get(friendId);
		}
		return this.messages.get(friendId);
	}


    private async listenMessages(): Promise<void> {
        client.chat.listen.subscribe(undefined, {
            onData: async ({ data, type }) => {
                const otherUserId =
                    this.userClass.data?.id === data.senderId
                        ? data.receiverId
                        : data.senderId;

				const messages = this.getMessages(otherUserId);
				if (!messages) return;

                switch (type) {
                    case "message": {
                        messages.push(data);
                        await tick();
                        this.scrollDown();
                        break;
                    }
                    case "removal": {
                        const index = messages.findIndex(
                            (msg) => msg.id === data.id,
                        );
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

    scrollDown() {
        const container = this.messagesContainer;
        if (container) {
            tick().then(() => {
                const scrollHeight = container.scrollHeight;
                container.scrollTop = scrollHeight;

                setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                }, 50);
            });
        }
    }

    private setupObserver() {
        // Clean up any existing observer
        if (this.observer) {
            this.observer.disconnect();
        }

        // Create a new observer with the current container
        this.observer = new IntersectionObserver(
            async ([entry]) => {
                if (entry.isIntersecting) {
                    await this.loadMoreMessages();
                }
            },
            {
                root: this.messagesContainer,
                threshold: 0.1,
                rootMargin: "100px",
            },
        );

        if (this.loadMoreTrigger) {
            this.observer.observe(this.loadMoreTrigger);
        }
    }

    async loadMoreMessages() {
        if (!this.selectedFriend) {
            return;
        }
        const messages = this.messages.get(this.selectedFriend);
        if (!messages || this.endReached) return;

        const container = this.messagesContainer;
        if (!container) return;

        const prevScrollHeight = container.scrollHeight;
        const prevScrollTop = container.scrollTop;

        try {
            const res = await client.chat.get.query({
                friendId: this.selectedFriend,
                limit: 20,
                offset: messages.length,
            });

            if (res.length > 0) {
                res.reverse(); // Make sure messages are in correct order
                messages.unshift(...res);
                if (res.length < 20) this.endReached = true;
                await tick();
                const newScrollHeight = container.scrollHeight;
                const heightDifference = newScrollHeight - prevScrollHeight;
                container.scrollTop = prevScrollTop + heightDifference;
            } else {
                this.endReached = true;
            }
        } catch (error) {
            console.error("Error loading more messages:", error);
        }
    }

    resetObserver() {
        this.setupObserver();
        this.scrollDown();
    }
}
