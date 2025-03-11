import { EventEmitter, on } from "node:events";

type EventName<T> = keyof T & string;
type EventPrefix<E> = E extends `${infer P}.${string}` ? P : never;

type Event<T, E extends EventName<T>> = {
    type: E extends `${string}.${infer Action}` ? Action : never;
} & {
    [P in EventPrefix<E>]: T[E];
};

/**
 * A strongly-typed event emitter that enforces type safety for event names and payloads.
 * It extends the standard `EventEmitter` to provide a more structured way of handling events,
 * especially when dealing with complex event payloads.
 *
 * @template T An interface defining the structure of event payloads. Each key in `T` represents an event name,
 *           and the corresponding value represents the payload type for that event.
 *
 * @example
 * ```typescript
 * interface MyEvents {
 *   'user.created': { userId: string; username: string };
 *   'user.deleted': { userId: string };
 *   'item.added': { itemId: string; itemName: string };
 * }
 *
 * const emitter = new TypedEventEmitter<MyEvents>();
 *
 * // Listening to a specific event
 * emitter.on('user.created', (payload) => {
 *   console.log('User created:', payload.userId, payload.username);
 * });
 *
 * // Emitting an event
 * emitter.emit('user.created', { userId: '123', username: 'john.doe' });
 *
 * // Streaming events with a prefix
 * async function logItemEvents() {
 *   for await (const event of emitter.stream('item')) {
 *     console.log('Item event:', event);
 *   }
 * }
 *
 * logItemEvents();
 *
 * emitter.emit('item.added', { itemId: '456', itemName: 'widget' });
 * emitter.emit('item.deleted', { itemId: '456' });
 * ```
 */
export class TypedEventEmitter<T extends object = Record<never, never>> {
    private emitter = new EventEmitter();
    private prefixStreams = new Map<string, Set<(payload: unknown) => void>>();

    constructor() {
        this.emitter.on("*", (eventName: string, payload: unknown) => {
            for (const [prefix, listeners] of this.prefixStreams) {
                if (eventName.startsWith(`${prefix}.`)) {
                    for (const listener of listeners) listener(payload);
                }
            }
        });
    }

    on<E extends EventName<T>>(
        eventName: E,
        listener: (payload: T[E]) => void,
    ) {
        this.emitter.on(eventName, listener);
        return this;
    }

    off<E extends EventName<T>>(
        eventName: E,
        listener: (payload: T[E]) => void,
    ) {
        this.emitter.off(eventName, listener);
        return this;
    }

    emit<E extends EventName<T>>(eventName: E, payload: T[E]) {
        const [category, action] = eventName.split(".");
        if (!category || !action) {
            throw new Error(
                `Invalid event name "${eventName}". Expected format: "category.action"`,
            );
        }
        const eventPayload = Object.defineProperty(
            {
                type: action,
                [category]: payload,
            },
            "rawPayload",
            { value: payload, enumerable: false },
        );
        const emitted = this.emitter.emit(eventName, eventPayload);
        this.emitter.emit("*", eventName, eventPayload);
        return emitted;
    }

    /**
     * Streams events that match the specified pattern. The pattern can be either a full event name
     * or a prefix to match multiple events. e.g. `stream('user')` will match all events starting with `user.`
     * @param eventName The name of the event to stream, or a prefix to match multiple events.
     */
    stream<E extends EventName<T>>(
        eventName: E,
    ): AsyncIterableIterator<Event<T, E>>;
    stream<P extends EventPrefix<EventName<T>>>(
        prefix: P,
    ): AsyncIterableIterator<Event<T, Extract<EventName<T>, `${P}.${string}`>>>;
    stream(pattern: string): AsyncIterableIterator<unknown> {
        if (pattern.includes(".")) {
            // Existing specific event stream
            const generator = async function* (this: TypedEventEmitter<T>) {
                const iterator = on(this.emitter, pattern);
                try {
                    for await (const [payload] of iterator) {
                        yield payload;
                    }
                } finally {
                    iterator.return?.();
                }
            }.bind(this)();
            return generator;
        }
        const prefix = pattern;
        const generator = async function* (this: TypedEventEmitter<T>) {
            const queue: unknown[] = [];
            let resolveQueue: (() => void) | null = null;

            const listener = (payload: unknown) => {
                queue.push(payload);
                if (resolveQueue) {
                    resolveQueue();
                    resolveQueue = null;
                }
            };

            if (!this.prefixStreams.has(prefix)) {
                this.prefixStreams.set(prefix, new Set());
            }
            const listeners = this.prefixStreams.get(prefix);
            if (!listeners) {
                throw new Error(`No listeners found for prefix: ${prefix}`);
            }
            listeners.add(listener);

            try {
                while (true) {
                    while (queue.length > 0) {
                        yield queue.shift();
                    }
                    await new Promise<void>((resolve) => {
                        resolveQueue = resolve;
                    });
                }
            } finally {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.prefixStreams.delete(prefix);
                }
            }
        }.bind(this)();
        return generator;
    }
}

export function getEnv<T extends string>(...vars: T[]): Record<T, string> {
    const result: Record<T, string> = {} as Record<T, string>;
    for (const v of vars) {
        const value = process.env[v];
        if (value === undefined) {
            throw new Error(`Missing environment variable: ${v}`);
        }
        result[v] = value;
    }
    return result;
}
