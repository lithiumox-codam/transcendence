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
import { getBackendUrl } from "./getUrls";
import { toast } from "svelte-sonner";

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
                            toast.error("Session expired, please login again");
                            localStorage.removeItem("token");
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

const generalErrorLink: TRPCLink<AppRouter> = () => {
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
                        err.data?.code !== "UNAUTHORIZED"
                    ) {
                        toast.error(err.message);
                    } else {
                        toast.error("An unknown error occurred");
                    }
                    observer.error(err);
                },
            });

            return subscription;
        });
    };
};

const wsClient = createWSClient({
    url: (() => {
        if (browser)
            return `${getBackendUrl()}trpc?token=${localStorage.getItem("token")}`;
        return `${getBackendUrl()}trpc`;
    })(),
});

export const client = createTRPCClient<AppRouter>({
    links: [
        generalErrorLink,
        unauthorizedRedirectLink,
        wsLink<AppRouter>({ client: wsClient, transformer: superjson }),
    ],
});
