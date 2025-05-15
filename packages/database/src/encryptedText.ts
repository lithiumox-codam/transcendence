import crypto from "node:crypto";
import { customType } from "drizzle-orm/sqlite-core";

const BACKEND_SECRET = process.env.VITE_BACKEND_SECRET;
if (!BACKEND_SECRET) {
    throw new Error(
        "Missing VITE_BACKEND_SECRET in .env.  Provide a strong, long secret.",
    );
}

const ALGORITHM = "aes-256-ctr";
const KEY = crypto.createHash("sha256").update(BACKEND_SECRET).digest();
const IV_LENGTH = 16;

function encrypt(value: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + encrypted; // Prepend IV
}

function decrypt(value: string): string {
    const iv = Buffer.from(value.slice(0, IV_LENGTH * 2), "hex");
    const encrypted = value.slice(IV_LENGTH * 2);
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

export const encryptedText = customType<{ data: string }>({
    dataType() {
        return "text";
    },
    fromDriver(value: unknown): string {
        if (typeof value !== "string") {
            throw new Error("Expected string value from driver");
        }
        try {
            return decrypt(value);
        } catch (error) {
            console.error("Decryption error:", error);
            throw new Error(`Failed to decrypt value: ${error}`);
        }
    },
    toDriver(value: string): string {
        return encrypt(value);
    },
});
