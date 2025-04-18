import { page } from "$app/state";
import { goto } from "$app/navigation";

/**
 * Redirects the user to a specific URL based on the "redirect" query parameter.
 */
export function redirectParam() {
    const redirect = page.url.searchParams.get("redirect");
    if (redirect) {
        goto(redirect);
    } else {
        goto("/stats");
    }
}
