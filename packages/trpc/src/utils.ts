import { EventEmitter, on } from "node:events";

export class TypedEventEmitter<T extends object> {
    private emitter = new EventEmitter();

    on<K extends keyof T & string>(
        eventName: K,
        listener: (payload: T[K]) => void,
    ): this {
        this.emitter.on(eventName, listener as (...args: unknown[]) => void);
        return this;
    }

    off<K extends keyof T & string>(
        eventName: K,
        listener: (payload: T[K]) => void,
    ): this {
        this.emitter.off(eventName, listener as (...args: unknown[]) => void);
        return this;
    }

    emit<K extends keyof T & string>(eventName: K, payload: T[K]): boolean {
        return this.emitter.emit(eventName, payload);
    }

    async *iterate<K extends keyof T & string>(
        eventName: K,
    ): AsyncIterableIterator<T[K]> {
        for await (const args of on(this.emitter, eventName)) {
            // We assume that the first argument is the payload
            yield args[0] as T[K];
        }
    }
}
