import { cleanEnv, num, str } from "envalid";

export const env = cleanEnv(process.env, {
    BACKEND_PORT: num({ default: 8080 }),
    BACKEND_HOST: str({ default: "0.0.0.0" }),
    BACKEND_SECRET: str(),
});
