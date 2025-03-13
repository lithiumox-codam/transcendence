import { goto } from "$app/navigation";
import { client } from "$lib/trpc";
import type { User } from "@repo/database";

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
            if (!res || res.length === 0) goto("/login");
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
            onData: (event) => {
                this.data = event.data;
            },
        });
    }

    async listenFriends() {
        client.user.friends.listen.subscribe(undefined, {
            onData: async (event) => {
                const { type, data } = event;
                
                switch (type) {
                    case "new":
                        {
                            const friendId =
                                data.friendId === this.data?.id
                                    ? data.userId
                                    : data.friendId;
                            const friend =
                                await client.user.getById.query(friendId);
                            if (!friend) return;
                            this.friends = [...this.friends, friend];
                            
                            // Remove from requests if it was there
                            this.incomingRequests = this.incomingRequests.filter(
                                (f) => f.id !== friendId
                            );
                        }
                        break;
                    case "removed":
                        {
                            // The endpoint returns an array with the removed friendship entries
                            const friendIds = data.map(item => 
                                item.userId === this.data?.id ? item.friendId : item.userId
                            );
                            this.friends = this.friends.filter(
                                (f) => !friendIds.includes(f.id)
                            );
                        }
                        break;
                    case "update":
                        {
                            // data is the user ID that was updated
                            const friendId = data;
                            if (this.friends.some(f => f.id === friendId)) {
                                const updatedFriend = await client.user.getById.query(friendId);
                                if (!updatedFriend) return;
                                this.friends = this.friends.map((f) =>
                                    f.id === friendId ? updatedFriend : f
                                );
                            }
                        }
                        break;
                    case "request":
                        {
                            // data is the friendship object
                            if (data.friendId === this.data?.id) {
                                const requester = await client.user.getById.query(data.userId);
                                if (!requester) return;
                                this.incomingRequests = [...this.incomingRequests, requester];
                            }
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
     * Sends a friend request to a user by their ID
     */
    async sendFriendRequest(userId: number) {
        try {
            await client.user.friends.add.mutate(userId);
            const user = await client.user.getById.query(userId);
            if (!user) return;
            this.outgoingRequests = [...this.outgoingRequests, user];
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Accepts an incoming friend request by adding them back
     */
    async acceptFriendRequest(userId: number) {
        try {
            await client.user.friends.add.mutate(userId);
            const user = this.incomingRequests.find(u => u.id === userId);
            if (user) {
                this.friends = [...this.friends, user];
                this.incomingRequests = this.incomingRequests.filter(u => u.id !== userId);
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Rejects an incoming friend request by removing the one-way relationship
     */
    async rejectFriendRequest(userId: number) {
        try {
            await client.user.friends.remove.mutate(userId);
            this.incomingRequests = this.incomingRequests.filter(u => u.id !== userId);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Cancels an outgoing friend request by removing it
     */
    async cancelFriendRequest(userId: number) {
        try {
            await client.user.friends.remove.mutate(userId);
            this.outgoingRequests = this.outgoingRequests.filter(u => u.id !== userId);
        } catch (e) {
            console.error(e);
        }
    }

    isFriend(userId: number): boolean {
        return this.friends.some(f => f.id === userId);
    }

    hasIncomingRequestFrom(userId: number): boolean {
        return this.incomingRequests.some(u => u.id === userId);
    }

    hasSentRequestTo(userId: number): boolean {
        return this.outgoingRequests.some(u => u.id === userId);
    }
}
