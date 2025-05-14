import type { EventMap } from "./Map.ts";
import { TypedEventEmitter } from "./typedEmitter.ts";

export const emitter = new TypedEventEmitter<EventMap>();
