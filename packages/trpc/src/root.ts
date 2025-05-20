import { authRouter } from "./router/auth.ts";
import { blockRouter } from "./router/block.ts";
import { chatRouter } from "./router/chat.js";
import { gameRouter } from "./router/game.ts";
import { statsRouter } from "./router/stats.ts";
import { statusRouter } from "./router/status.ts";
import { userRouter } from "./router/user.ts";
import { createTRPCRouter } from "./trpc.ts";

export const appRouter = createTRPCRouter({
    user: userRouter,
    chat: chatRouter,
    auth: authRouter,
    game: gameRouter,
    stats: statsRouter,
    block: blockRouter,
    status: statusRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
