import { hashPassword, sign, verify, verifyPassword } from "@repo/auth";
import { db, friends, passwordSchema, users } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "../trpc.ts";

export const gdprRouter = createTRPCRouter({
	deleteAccount: protectedProcedure
		.input(z.object({ username: z.string() }))
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

			const validUsername = user[0].name === input.username;

			if (!validUsername) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid credentials",
				});
			}

			await db.update(users).set({
				name: "[DELETED]",
				email: "[DELETED]",
				avatar: "[DELETED]",
				password: "",
			}).where(eq(users.id, ctx.user.id));

			await db.delete(friends).where(or(eq(friends.userId, ctx.user.id), eq(friends.friendId, ctx.user.id)));
		}),

		changePassword: protectedProcedure
		.input(z.object({ oldPassword: passwordSchema, newPassword: passwordSchema }))
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

			const validPassword = await verifyPassword(user[0].password, input.oldPassword);

			if (!validPassword) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid credentials",
				});
			}

			const hashedPassword = await hashPassword(input.newPassword);

			await db.update(users).set({ password: hashedPassword }).where(eq(users.id, ctx.user.id));
		}),

		setPassword: protectedProcedure
		.input(z.object({ password: passwordSchema }))
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

			const hashedPassword = await hashPassword(input.password);

			await db.update(users).set({ password: hashedPassword }).where(eq(users.id, ctx.user.id));
		}
	),
});
