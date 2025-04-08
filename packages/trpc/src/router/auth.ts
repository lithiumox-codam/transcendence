import {
    hashPassword,
    sign,
    verifyPassword,
    googleProvider,
    TokenPayload,
} from "@repo/auth";
import { db, passwordSchema, userNameSchema, users } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "../trpc.ts";
import { authenticator } from "otplib";

export const authRouter = createTRPCRouter({
    signup: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: passwordSchema,
                name: userNameSchema,
            }),
        )
        .mutation(async (opts) => {
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
            opts.ctx.user = user[0];
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
        .input(
            z.object({
                email: z.string(),
                password: z.string(),
                otpToken: z.string().optional(),
            }),
        )
        .mutation(async (opts) => {
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

            if (user[0].secret) {
                if (!opts.input.otpToken) {
                    return "2fa";
                }
                const isValidOtp = authenticator.verify({
                    token: opts.input.otpToken,
                    secret: user[0].secret,
                });
                if (!isValidOtp) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Invalid OTP",
                    });
                }
            }

            opts.ctx.user = user[0];
            const jwt = await sign({ userId: user[0].id });

            return jwt;
        }),
    oauthLogin: publicProcedure
        .input(z.string())
        .mutation(async ({ input }) => {
            const provider = googleProvider;

            const { clientId, clientSecret } = provider;
            if (!clientId || !clientSecret) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Google Sign-in not configured`,
                });
            }

            const tokenUrl = provider.tokenHost + provider.tokenPath;
            const tokenPayload = new TokenPayload(
                clientId,
                clientSecret,
                input,
            );

            try {
                const response = await fetch(tokenUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: tokenPayload.toQueryString(),
                });

                const { access_token } = await response.json();

                const userResponse = await fetch(
                    "https://www.googleapis.com/oauth2/v1/userinfo",
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    },
                );

                const { email } = await userResponse.json();

                let user = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email));

                if (user.length === 0 || !user[0]) {
                    user = await db
                        .insert(users)
                        .values({
                            email,
                            name: email.split("@")[0],
                            password: "",
                        })
                        .returning();

                    if (user.length === 0 || !user[0]) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create user",
                        });
                    }
                }

                const jwt = await sign({ userId: user[0].id });

                return jwt;
            } catch (e) {
                console.log(e);
            }

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to login",
            });
        }),
    toggle2FA: protectedProcedure.mutation(async ({ ctx }) => {
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

        if (user[0].secret) {
            await db
                .update(users)
                .set({
                    secret: null,
                })
                .where(eq(users.id, ctx.user.id));
        } else {
            const secret = authenticator.generateSecret();
            await db
                .update(users)
                .set({
                    secret,
                })
                .where(eq(users.id, ctx.user.id));

            const otp = authenticator.keyuri(
                user[0].name,
                "transcendence",
                secret,
            );
            return otp;
        }

        return null;
    }),
});
