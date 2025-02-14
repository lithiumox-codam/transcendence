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

        const hashedPassword = await hashPassword(password);

        // create user
        const user = await db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword,
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
    changePassword: protectedProcedure
        .input(
            z.object({
                old_password: z.string(),
                new_password: passwordSchema,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const result = await db
                .select({ password: users.password })
                .from(users)
                .where(eq(users.id, ctx.user.id));

            if (result.length === 0 || !result[0]) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "User not found",
                });
            }
            const password = result[0].password;

            const isValid = await verifyPassword(password, input.old_password);
            if (!isValid) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Invalid password",
                });
            }

            const hashedPassword = await hashPassword(input.new_password);
            await db
                .update(users)
                .set({ password: hashedPassword })
                .where(eq(users.id, ctx.user.id));

            return true;
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
                    message: "Invalid credentials",
                });
            }
            const isValid = await verifyPassword(
                user[0].password,
                opts.input.password,
            );
            if (!isValid) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Invalid credentials",
                });
            }

            const jwt = await sign({ userId: user[0].id });

            return jwt;
        }),
});
