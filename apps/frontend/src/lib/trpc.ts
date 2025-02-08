import type { AppRouter } from "@repo/trpc";
import {
    createTRPCProxyClient,
    createWSClient,
    httpBatchLink,
    wsLink,
} from "@trpc/client";
import superjson from "superjson";

const wsClient = createWSClient({
    url: "ws://localhost:8080/trpc",
});

export const client = createTRPCProxyClient<AppRouter>({
    links: [
        wsLink<AppRouter>({ client: wsClient }),
        httpBatchLink({
            // Replace this URL with that of your tRPC server
            url: "http://localhost:8080/trpc",
        }),
    ],
    transformer: superjson,
});
