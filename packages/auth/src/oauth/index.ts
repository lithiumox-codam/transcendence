export * from "./providers.ts";

export class TokenPayload {
    grant_type: string;
    scope: string;
    code: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;

    constructor(client_id: string, client_secret: string, code: string) {
        this.grant_type = "authorization_code";
        this.code = code;
        this.scope = "openid profile email";
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.redirect_uri = "http://localhost:5173/oauth/callback";
    }

    /**
     * Converts the token payload to a query string.
     * @returns The query string.
     */
    toQueryString(): string {
        return new URLSearchParams({
            grant_type: this.grant_type,
            scope: this.scope,
            code: this.code,
            client_id: this.client_id,
            client_secret: this.client_secret,
            redirect_uri: this.redirect_uri,
        }).toString();
    }
}
