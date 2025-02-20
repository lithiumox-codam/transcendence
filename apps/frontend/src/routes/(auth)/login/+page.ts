import type { PageLoad } from "./$types";

export const load = (async ({ url }) => {
    return {
        redirect: url.searchParams.get("redirect"),
    };
}) satisfies PageLoad;
