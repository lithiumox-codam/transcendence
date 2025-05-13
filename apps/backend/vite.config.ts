import * as path from "node:path";
import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";

export default defineConfig({
    // Keep server config for dev mode
    server: {
        port: 8080,
    },

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

    // --- Resolve Aliases ---
    resolve: {
        alias: {
            // Use the derived __dirname for robustness
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
