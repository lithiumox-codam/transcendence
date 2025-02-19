import { type Game, GameInsert, gameInsertSchema, games } from "@repo/database";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc.ts";

export const gameRouter = createTRPCRouter({
    ping: publicProcedure
        .input(z.object({ msg: z.string() }))
        .query(async ({ input }) => {
            const res = input.msg;
            return res;
        }),
});
