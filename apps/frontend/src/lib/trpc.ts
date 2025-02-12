import { browser } from "$app/environment";
import type { AppRouter } from "@repo/trpc";
import { createTRPCClient, createWSClient, wsLink } from "@trpc/client";
import superjson from "superjson";

const wsClient = createWSClient({
    url: (() => {
        if (browser)
            return `http://localhost:8080/trpc?token=${localStorage.getItem("token")}`;
        return "http://localhost:8080/trpc";
    })(),
});

const getToken = () => {
    if (browser) return localStorage.getItem("token");
    return null;
};

export const client = createTRPCClient<AppRouter>({
    links: [wsLink<AppRouter>({ client: wsClient, transformer: superjson })],
});
