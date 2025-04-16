import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import type { AppRouter } from "@repo/trpc";
import {
    TRPCClientError,
    type TRPCLink,
    createTRPCClient,
    createWSClient,
    wsLink,
} from "@trpc/client";
import { observable } from "@trpc/server/observable";
import superjson from "superjson";

export function isTRPCClientError(
    cause: unknown,
): cause is TRPCClientError<AppRouter> {
    return cause instanceof TRPCClientError;
}

const unauthorizedRedirectLink: TRPCLink<AppRouter> = () => {
    return ({ op, next }) => {
        return observable((observer) => {
            const subscription = next(op).subscribe({
                next: (value) => {
                    observer.next(value);
                },
                complete: () => {
                    observer.complete();
                },
                error: (err) => {
                    if (
                        isTRPCClientError(err) &&
                        err.data?.code === "UNAUTHORIZED"
                    ) {
                        if (browser) {
                            goto("/login").catch((e) => {
                                console.error(
                                    "Failed to redirect to /login:",
                                    e,
                                );
                            });
                            observer.error(err);
                        } else {
                            console.warn(
                                "UNAUTHORIZED error received on server-side for",
                                op.path,
                            );
                            observer.error(err);
                        }
                    } else {
                        observer.error(err);
                    }
                },
            });

            return subscription;
        });
    };
};

const wsClient = createWSClient({
    url: (() => {
        if (browser)
            return `http://localhost:8080/trpc?token=${localStorage.getItem("token")}`;
        return "http://localhost:8080/trpc";
    })(),
});

export const client = createTRPCClient<AppRouter>({
    links: [
        unauthorizedRedirectLink,
        wsLink<AppRouter>({ client: wsClient, transformer: superjson }),
    ],
});
