export interface ProviderConfig {
    authHost: string;
    authPath: string;
    tokenHost: string;
    tokenPath: string;
    clientId?: string;
    clientSecret?: string;
}

export type ClientProviderConfig = Omit<ProviderConfig, "clientSecret">;

export const googleProvider: ProviderConfig = {
    authHost: "https://accounts.google.com",
    authPath: "/o/oauth2/auth",
    tokenHost: "https://accounts.google.com",
    tokenPath: "/o/oauth2/token",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
};

export const { clientSecret, ...clientGoogleProvider } = googleProvider;
