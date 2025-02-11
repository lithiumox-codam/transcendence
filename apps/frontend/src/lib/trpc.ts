import { browser } from "$app/environment";
import type { AppRouter } from "@repo/trpc";
import {
    createTRPCProxyClient,
    createWSClient,
    httpBatchLink,
    splitLink,
    wsLink,
} from "@trpc/client";
import superjson from "superjson";

const wsClient = createWSClient({
    url: "ws://localhost:8080/trpc",
});

const getToken = () => {
    if (browser) return localStorage.getItem("token");
    return null;
};

export const client = createTRPCProxyClient<AppRouter>({
    links: [
        splitLink({
            condition: (op) => op.type === "subscription",
            true: wsLink<AppRouter>({ client: wsClient }),
            false: httpBatchLink({
                // Replace this URL with that of your tRPC server
                url: "http://localhost:8080/trpc",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            }),
        }),
    ],
    transformer: superjson,
});
