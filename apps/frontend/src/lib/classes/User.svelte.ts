import { goto } from "$app/navigation";
import { client, isTRPCClientError } from "$lib/trpc";
import type { User } from "@repo/database/types";
import { toast } from "svelte-sonner";

export class UserClass {
    data = $state<User | null>(null);
    friends = $state<User[]>([]);
    incomingRequests = $state<User[]>([]);
    outgoingRequests = $state<User[]>([]);
    isLoading = $state(true);

    #recentActions = $state.raw(new Map<string, number>());

    constructor() {
        this.initialize();
    }

    async initialize() {
        try {
            const [user] = await client.user.get.query();

            this.data = user;

            const [friendsList, incomingReqs, outgoingReqs] = await Promise.all(
                [
                    client.user.friends.list.query(),
                    client.user.friends.listRequests.query(),
                    client.user.friends.listSentRequests.query(),
                ],
            );

            this.friends = friendsList;
            this.incomingRequests = incomingReqs;
            this.outgoingRequests = outgoingReqs;

            this.listenUser();
            this.listenFriends();
        } catch (e) {
            if (isTRPCClientError(e)) {
                switch (e.data?.code) {
                    case "UNAUTHORIZED":
                        goto(`/login?redirect=${location.pathname}`);
                        break;
                    case "FORBIDDEN":
                        goto(`/login?redirect=${location.pathname}`);
                        break;
                    default:
                        console.error(e);
                        break;
                }
            }

            console.error("Failed to initialize user data:", e);
        } finally {
            this.isLoading = false;
        }
    }

    async listenUser() {
        client.user.listen.subscribe(undefined, {
            onData: ({ type, data }) => {
                switch (type) {
                    case "update":
                        if (this.data?.id === data.id) {
                            this.data = data;
                        }
                        break;
                    default:
                        break;
                }
            },
        });
    }

    async listenFriends() {
        client.user.friends.listen.subscribe(undefined, {
            onData: async ({ type, data }) => {
                const now = Date.now();
                const currentUserId = this.data?.id;

                // New friendship created
                if (type === "new") {
                    const friendId =
                        data.userId === currentUserId
                            ? data.friendId
                            : data.userId;

                    // Skip if this was our own action or friend already exists
                    if (
                        now -
                            (this.#recentActions.get(`new-${friendId}`) || 0) <
                        5000
                    )
                        return;
                    if (this.friends.some((f) => f.id === friendId)) return;

                    const friend = await client.user.getById.query(friendId);
                    if (friend) {
                        console.log("New friend added", friend);
                        toast.info("New friend added!", {
                            description: `${friend.name} is now your friend!`,
                        });
                        // Add to friends list
                        this.friends.push(friend);

                        // Remove from requests lists
                        this.incomingRequests = this.incomingRequests.filter(
                            (r) => r.id !== friendId,
                        );
                        this.outgoingRequests = this.outgoingRequests.filter(
                            (r) => r.id !== friendId,
                        );
                    }
                }

                // Friendship removed
                else if (type === "removed") {
                    console.log("Friend removed", data);
                    const friendIds = data.map((item) =>
                        item.userId === currentUserId
                            ? item.friendId
                            : item.userId,
                    );

                    // Skip if this was our own action
                    const wasLocalAction = friendIds.some(
                        (id) =>
                            now -
                                (this.#recentActions.get(`remove-${id}`) || 0) <
                            5000,
                    );

                    if (!wasLocalAction) {
                        // Remove from friends list
                        this.friends = this.friends.filter(
                            (f) => !friendIds.includes(f.id),
                        );
                    }
                } else if (type === "update") {
                    const friendId = data;

                    // Only update if they're in our friends list
                    if (this.friends.some((f) => f.id === friendId)) {
                        const updatedFriend =
                            await client.user.getById.query(friendId);
                        if (updatedFriend) {
                            this.friends = this.friends.map((f) =>
                                f.id === friendId ? updatedFriend : f,
                            );
                        }
                    }
                } else if (
                    type === "request" &&
                    data.friendId === currentUserId
                ) {
                    const requesterId = data.userId;

                    // Skip if already in requests
                    if (
                        !this.incomingRequests.some((r) => r.id === requesterId)
                    ) {
                        const requester =
                            await client.user.getById.query(requesterId);
                        if (requester) {
                            this.incomingRequests = [
                                ...this.incomingRequests,
                                requester,
                            ];
                        }
                    }
                }
            },
        });
    }

    async removeFriend(friendId: number) {
        try {
            this.friends = this.friends.filter((f) => f.id !== friendId);
            this.#recentActions.set(`remove-${friendId}`, Date.now());

            await client.user.friends.remove.mutate(friendId);
        } catch (e) {
            console.error("Failed to remove friend:", e);

            const friend = await client.user.getById
                .query(friendId)
                .catch(() => null);
            if (friend) {
                this.friends = [...this.friends, friend];
            }
        } finally {
            setTimeout(() => {
                this.#recentActions.delete(`remove-${friendId}`);
            }, 5000);
        }
    }

    /**
     * Sends a friend request to a user by their ID
     */
    async sendFriendRequest(userId: number) {
        try {
            // Get user first to ensure it exists
            const user = await client.user.getById.query(userId);
            if (!user) return;

            // Optimistically update UI
            this.outgoingRequests.push(user);

            await client.user.friends.add.mutate(userId);
        } catch (e) {
            console.error("Failed to send friend request:", e);
            this.outgoingRequests = this.outgoingRequests.filter(
                (u) => u.id !== userId,
            );
        }
    }

    /**
     * Accepts an incoming friend request by adding them back
     */
    async acceptFriendRequest(userId: number) {
        try {
            const user = this.incomingRequests.find((u) => u.id === userId);
            if (!user) return;

            // Optimistically update UI
            this.friends.push(user);
            this.incomingRequests = this.incomingRequests.filter(
                (u) => u.id !== userId,
            );

            // Record this action to prevent duplicate websocket update
            this.#recentActions.set(`new-${userId}`, Date.now());

            await client.user.friends.add.mutate(userId);
        } catch (e) {
            console.error("Failed to accept friend request:", e);
            const user = this.friends.find((u) => u.id === userId);
            if (user) {
                this.friends = this.friends.filter((u) => u.id !== userId);
                this.incomingRequests = [...this.incomingRequests, user];
            }
        } finally {
            setTimeout(() => {
                this.#recentActions.delete(`new-${userId}`);
            }, 5000);
        }
    }

    /**
     * Rejects an incoming friend request by removing the one-way relationship
     */
    async rejectFriendRequest(userId: number) {
        try {
            this.incomingRequests = this.incomingRequests.filter(
                (u) => u.id !== userId,
            );

            await client.user.friends.remove.mutate(userId);
        } catch (e) {
            console.error("Failed to reject friend request:", e);

            const user = await client.user.getById
                .query(userId)
                .catch(() => null);
            if (user) {
                this.incomingRequests.push(user);
            }
        }
    }

    /**
     * Cancels an outgoing friend request by removing it
     */
    async cancelFriendRequest(userId: number) {
        try {
            this.outgoingRequests = this.outgoingRequests.filter(
                (u) => u.id !== userId,
            );

            await client.user.friends.remove.mutate(userId);
        } catch (e) {
            console.error("Failed to cancel friend request:", e);

            const user = await client.user.getById
                .query(userId)
                .catch(() => null);
            if (user) {
                this.outgoingRequests = [...this.outgoingRequests, user];
            }
        }
    }

    isFriend(userId: number): boolean {
        return this.friends.some((f) => f.id === userId);
    }

    hasIncomingRequestFrom(userId: number): boolean {
        return this.incomingRequests.some((u) => u.id === userId);
    }

    hasSentRequestTo(userId: number): boolean {
        return this.outgoingRequests.some((u) => u.id === userId);
    }
}
