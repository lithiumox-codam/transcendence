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
	deleteAccount: protectedProcedure
		.input(z.object({ username: z.string(), password: z.string() }))
		.mutation(async ({ ctx, input }) => {

			const user = await db
				.select()
				.from(users)
				.where(eq(users.id, ctx.user.id));

			if (user.length === 0 || !user[0]) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid credentials",
				});
			}

			const validPassword = await verifyPassword(
				user[0].password,
				input.password,
			);

			const validUsername = user[0].name === input.username;

			if (!validPassword || !validUsername) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid credentials",
				});
			}

			await db.update(users).set({
				name: "[DELETED]",
				email: "[DELETED]",
				password: "[DELETED]",
			}).where(eq(users.id, ctx.user.id));
		}),
});
