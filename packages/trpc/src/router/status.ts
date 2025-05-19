import { emitter } from "../events/index.ts";
import {
    activeUsers,
    fetchFriends,
    handleUserConnect,
    handleUserDisconnect,
} from "../events/statusHandler.ts";
import { createTRPCRouter, protectedProcedure } from "../trpc.ts";

export const statusRouter = createTRPCRouter({
    presence: protectedProcedure.subscription(async function* (opts) {
        await handleUserConnect(opts.ctx.user);
        try {
            await new Promise<void>((resolve) => {
                opts.signal?.addEventListener("abort", () => {
                    resolve(); // Resolve the promise when the client disconnects
                });
                if (opts.signal?.aborted) resolve(); // Resolve immediately if the signal is already aborted
            });
        } finally {
            await handleUserDisconnect(opts.ctx.user);
        }
    }),
    getOnlineFriends: protectedProcedure.query(async ({ ctx }) => {
        const friends = await fetchFriends(ctx.user);
        const onlineFriendIds: number[] = [];
        for (const friend of friends) {
            if (activeUsers.has(friend.id)) {
                onlineFriendIds.push(friend.id);
            }
        }
        return onlineFriendIds;
    }),
    listen: protectedProcedure.subscription(({ ctx }) =>
        emitter.subscribeDomain("status", (event) => {
            if (event.data.userId === ctx.user.id) {
                return true;
            }
            return false;
        }),
    ),
});
