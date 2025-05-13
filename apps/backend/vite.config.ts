import * as path from "node:path";
import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";

export default defineConfig({
    server: {
        port: 8080,
    },
    envPrefix: "BACKEND_",
    build: {
        ssr: "./src/server.ts",
        target: "node22",
        outDir: "build",

        // Rollup specific options
        rollupOptions: {
            external: ["argon2", "better-sqlite3"],
            output: {
                format: "es",
            },
        },
    },
    plugins: [
        ...VitePluginNode({
            adapter: "fastify",
            appPath: "./src/server.ts",
            exportName: "backend",
            tsCompiler: "esbuild",
        }),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
