import { browser } from "$app/environment";
import type { AppRouter } from "@repo/trpc";
import {
    TRPCClientError,
    createTRPCClient,
    createWSClient,
    wsLink,
} from "@trpc/client";
import superjson from "superjson";

export function isTRPCClientError(
    cause: unknown,
): cause is TRPCClientError<AppRouter> {
    return cause instanceof TRPCClientError;
}

const wsClient = createWSClient({
    url: (() => {
        if (browser)
            return `http://localhost:8080/trpc?token=${localStorage.getItem("token")}`;
        return "http://localhost:8080/trpc";
    })(),
});

export const client = createTRPCClient<AppRouter>({
    links: [wsLink<AppRouter>({ client: wsClient, transformer: superjson })],
});
