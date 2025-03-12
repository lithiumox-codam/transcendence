import { goto } from "$app/navigation";
import { client } from "$lib/trpc";
import type { Friend, User } from "@repo/database";

export class UserClass {
    data = $state<User | null>(null);
    friends = $state<User[]>([]);
    incomingRequests = $state<User[]>([]);
    outgoingRequests = $state<User[]>([]);
    isLoading = $state(true);

    constructor() {
        this.initialize();
    }

    async initialize() {
        try {
            const res = await client.user.get.query();
            if (!res) goto("/login");
            this.friends = await client.user.friends.list.query();
            this.incomingRequests =
                await client.user.friends.listRequests.query();
            this.outgoingRequests =
                await client.user.friends.listSentRequests.query();
            this.data = res[0];
            this.listenUser();
            this.listenFriends();
        } catch (e) {
            console.error(e);
        } finally {
            this.isLoading = false;
        }
    }

    async listenUser() {
        client.user.listen.subscribe(undefined, {
            onData: async ({ data }) => {
                this.data = data;
            },
        });
    }

    async listenFriends() {
        client.user.friends.listen.subscribe(undefined, {
            onData: async ({ data, type }) => {
                switch (type) {
                    case "new":
                        {
                            const friend = await client.user.getById.query(
                                data.friendId,
                            );
                            if (!friend) return;
                            this.friends.push(friend);
                        }
                        break;
                    case "removed":
                        this.friends = this.friends.filter(
                            (f) => f.id !== data.friendId,
                        );
                        break;
                    case "update":
                        {
                            const friend = this.friends.find(
                                (f) => f.id === data,
                            );
                            if (!friend) return;
                            const res = await client.user.getById.query(data);
                            if (!res) return;
                            this.friends = this.friends.map((f) =>
                                f.id === data ? res : f,
                            );
                        }
                        break;
                    case "request":
                        {
                            const friend = await client.user.getById.query(
                                data.friendId,
                            );
                            if (!friend) return;
                            this.incomingRequests.push(friend);
                        }
                        break;
                }
            },
        });
    }

    async removeFriend(friendId: number) {
        try {
            await client.user.friends.remove.mutate(friendId);
            this.friends = this.friends.filter((f) => f.id !== friendId);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * This is a helper function that takes in a friend object and adds it to the user's friends list.
     */
    async addFriend(friend: Friend) {
        const id =
            friend.userId === this.data?.id ? friend.friendId : friend.userId;
        try {
            const res = await client.user.getById.query(id);
            if (!res) return;
            this.friends.push(res);
            this.incomingRequests = this.incomingRequests.filter(
                (f) => f.id !== id,
            );
        } catch (e) {
            console.error(e);
        }
    }
}
