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
            console.log(this.outgoingRequests);
            console.log(this.incomingRequests);

            this.data = res[0];
        } catch (e) {
            console.error(e);
        } finally {
            this.isLoading = false;
        }
    }

    async listenFriends() {
        client.user.friends.listen.subscribe(undefined, {
            onData: ({ data }) => {
                switch (data.type) {
                    case "new":
                        this.addFriend(data.friend);
                        break;
                    case "del":
                        this.friends = this.friends.filter(
                            (f) => f.id !== data.friend.friendId,
                        );
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
            this.friends.push(res[0]);
            this.incomingRequests = this.incomingRequests.filter(
                (f) => f.id !== id,
            );
        } catch (e) {
            console.error(e);
        }
    }
}
