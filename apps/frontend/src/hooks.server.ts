import { i18n } from "$lib/i18n";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
const handleParaglide: Handle = i18n.handle();

const corsHandler: Handle = async ({ resolve, event }) => {
    const response = await resolve(event);
    response.headers.append("Access-Control-Allow-Origin", "*");

    return response;
};

export const handle: Handle = sequence(corsHandler, handleParaglide);
