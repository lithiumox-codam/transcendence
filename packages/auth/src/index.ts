import * as jose from "jose";
import type { JWTPayload } from "jose";

function getSecret(): Uint8Array {
    const envValue = process.env.CRYPTO_SECRET;
    if (!envValue) {
        throw new Error("Missing CRYPTO_SECRET environment variable");
    }
    return new TextEncoder().encode(envValue);
}

/**
 * Signs a JWT (JSON Web Token) with the given payload and secret.
 * @param payload The payload to include in the JWT.
 * @param secret The secret key used to sign the JWT.  Ensure this is
 *               kept securely.
 * @param expiresIn  A string or number representing the expiration time.
 *                   Examples: "1h", "2d", 3600 (seconds).  Defaults to "1h".
 * @returns A promise that resolves to the signed JWT.
 */
export async function sign(
    payload: JWTPayload,
    expiresIn: string | number = "1h",
): Promise<string> {
    const alg = "HS256"; // Consider RS256 or ES256 for higher security
    try {
        const jwt: string = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setExpirationTime(expiresIn)
            .sign(getSecret());
        return jwt;
    } catch (error) {
        console.error("JWT signing error:", error);
        throw new Error("Failed to sign JWT"); // Re-throw or handle as needed
    }
}

/**
 * Verifies a JWT and returns the payload.
 * @param token The JWT to verify.
 * @param secret The secret key used to sign the JWT.
 * @returns A promise that resolves to the JWT payload.
 * @throws Error if the JWT is invalid or expired.
 */
export async function verify(token: string): Promise<JWTPayload> {
    try {
        const { payload } = await jose.jwtVerify(token, getSecret(), {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        console.error("JWT verification error:", error);
        throw new Error("Invalid JWT"); // Re-throw or handle as needed
    }
}
