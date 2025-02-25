import { hashPassword, sign, verify, verifyPassword } from "@repo/auth";
import { db, passwordSchema, userInputSchema, users } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "../trpc.ts";

export const gdprRouter = createTRPCRouter({
	deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
		await db.update(users).set({
			name: "[DELETED]",
			email: "[DELETED]",
		}).where(eq(users.id, ctx.user.id));
	}),
});
