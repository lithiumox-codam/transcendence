import type { AppRouter } from "@repo/trpc";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

export const client = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            // Replace this URL with that of your tRPC server
            url: "http://localhost:8080/trpc/",
        }),
    ],
});
