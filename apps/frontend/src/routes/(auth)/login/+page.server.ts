import { clientGoogleProvider } from "@repo/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    return clientGoogleProvider;
};
