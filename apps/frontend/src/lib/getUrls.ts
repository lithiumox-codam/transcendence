import { browser } from "$app/environment";

export function getBackendUrl() {
    if (import.meta.env.PROD && browser) {
        return `${window.origin}/api/`;
    }
    return "http://localhost:8080/";
}

export function getFrontendUrl() {
    if (import.meta.env.PROD && browser) {
        return `${window.origin}`;
    }
    return "http://localhost:5173";
}
