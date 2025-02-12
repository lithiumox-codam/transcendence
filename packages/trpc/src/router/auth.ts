import { sign, verify } from "@repo/auth";
import { db, userInputSchema, users } from "@repo/database";
import { TRPCError } from "@trpc/server";
import cookie from "cookie";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc.ts";

export const authRouter = createTRPCRouter({
    signup: publicProcedure.input(userInputSchema).mutation(async (opts) => {
        const emailExists = await db
            .select()
            .from(users)
            .where(eq(users.email, opts.input.email));
        if (emailExists.length > 0) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Email is already taken",
                cause: "email",
            });
        }
        const nameExists = await db
            .select()
            .from(users)
            .where(eq(users.name, opts.input.name));
        if (nameExists.length > 0) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Name is already taken",
                cause: "name",
            });
        }

        const { password, name, email } = opts.input;

        // create user
        const user = await db
            .insert(users)
            .values({
                name,
                email,
                password,
            })
            .returning();
        if (user.length === 0 || !user[0]) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create user",
            });
        }

        const jwt = await sign({ userId: user[0].id });

        return jwt;
    }),
    login: publicProcedure
        .input(z.object({ email: z.string(), password: z.string() }))
        .mutation(async (opts) => {
            console.log(opts);
            const user = await db
                .select()
                .from(users)
                .where(eq(users.email, opts.input.email));
            if (user.length === 0 || !user[0]) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "User not found",
                });
            }
            if (user[0].password !== opts.input.password) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Password is not correct",
                });
            }

            const jwt = await sign({ userId: user[0].id });

            return jwt;
        }),
});
