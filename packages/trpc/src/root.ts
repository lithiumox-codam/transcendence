import { authRouter } from "./router/auth.ts";
import { chatRouter } from "./router/chat.js";
import { userRouter } from "./router/user.js";
import { createTRPCRouter } from "./trpc.js";

export const appRouter = createTRPCRouter({
    user: userRouter,
    chat: chatRouter,
    auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
