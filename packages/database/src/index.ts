/**
 * Main database package entrypoint
 *
 * This file provides different exports depending on whether you need:
 * 1. Just the schema types (frontend-safe, no backend dependencies)
 * 2. The full database implementation (for backend use)
 */

// Export everything from the database implementation
export * from "./database.ts";

// Re-export the schema-only module for convenience
export * from "./schemas/chat.ts";
export * from "./schemas/user.ts";
export * from "./schemas/game.ts";
