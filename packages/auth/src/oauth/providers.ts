export interface ProviderConfig {
    authHost: string;
    authPath: string;
    tokenHost: string;
    tokenPath: string;
}

export type ProviderName = "google" | "github";

export const providers: Record<ProviderName, ProviderConfig> = {
    google: {
        authHost: "https://accounts.google.com",
        authPath: "/o/oauth2/auth",
        tokenHost: "https://accounts.google.com",
        tokenPath: "/o/oauth2/token",
    },
    github: {
        authHost: "https://github.com",
        authPath: "/login/oauth/authorize",
        tokenHost: "https://github.com",
        tokenPath: "/login/oauth/access_token",
    },
};
