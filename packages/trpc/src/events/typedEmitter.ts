/**
 * A union type of specific event names in the format "domain:event".
 */
export type SpecificEventName<T extends Record<string, Record<string, unknown>>> = {
  [D in keyof T & string]: {
    [E in keyof T[D] & string]: `${D}:${E}`;
  }[keyof T[D] & string];
}[keyof T & string];

/**
 * Extracts the payload type for a given specific event name.
 */
export type ExtractPayload<
  T extends Record<string, Record<string, unknown>>,
  K extends SpecificEventName<T>
> = K extends `${infer D}:${infer E}`
  ? D extends keyof T
    ? E extends keyof T[D]
      ? T[D][E]
      : never
    : never
  : never;

/**
 * A union type of domain names.
 */
export type DomainEventName<T extends Record<string, Record<string, unknown>>> =
  keyof T & string;

/**
 * Constructs a union type for all events in a given domain.
 */
export type DomainEvents<
  T extends Record<string, Record<string, unknown>>,
  D extends DomainEventName<T>
> = {
  [E in keyof T[D] & string]: { type: E; data: T[D][E] };
}[keyof T[D] & string];

/**
 * A filter function that determines if an event should be processed.
 */
export type EventFilter<T> = (data: T) => boolean;

/**
 * A high-performance, type-safe event emitter.
 */
export class TypedEventEmitter<TEventMap extends Record<string, Record<string, unknown>>> {
  private specificHandlers = new Map<
    SpecificEventName<TEventMap>,
    Set<{
      handler: (data: unknown) => void;
      filter: EventFilter<unknown> | null;
    }>
  >();
  private domainHandlers = new Map<
    DomainEventName<TEventMap>,
    Set<{
      handler: (event: unknown) => void;
      filter: EventFilter<unknown> | null;
    }>
  >();

  /**
   * Subscribes to a specific event.
   */
  on<E extends SpecificEventName<TEventMap>>(
    eventName: E,
    handler: (data: ExtractPayload<TEventMap, E>) => void,
    filter?: EventFilter<ExtractPayload<TEventMap, E>>
  ): () => void {
    if (!eventName.includes(":")) {
      throw new Error("Expected specific event name with format 'domain:event'");
    }

    const key = eventName;
    let set = this.specificHandlers.get(key);
    if (!set) {
      set = new Set();
      this.specificHandlers.set(key, set);
    }

    const handlerObj = {
      handler: handler as (data: unknown) => void,
      filter: filter ? (filter as EventFilter<unknown>) : null,
    };
    set.add(handlerObj);

    return () => {
      const currentSet = this.specificHandlers.get(key);
      if (currentSet) {
        currentSet.delete(handlerObj);
        if (currentSet.size === 0) {
          this.specificHandlers.delete(key);
        }
      }
    };
  }

  /**
   * Subscribes to all events in a domain.
   */
  onDomain<D extends DomainEventName<TEventMap>>(
    domain: D,
    handler: (event: DomainEvents<TEventMap, D>) => void,
    filter?: EventFilter<DomainEvents<TEventMap, D>>
  ): () => void {
    if (domain.includes(":")) {
      throw new Error("Expected domain name without ':'");
    }

    const key = domain;
    let set = this.domainHandlers.get(key);
    if (!set) {
      set = new Set();
      this.domainHandlers.set(key, set);
    }

    const handlerObj = {
      handler: handler as (event: unknown) => void,
      filter: filter ? (filter as EventFilter<unknown>) : null,
    };
    set.add(handlerObj);

    return () => {
      const currentSet = this.domainHandlers.get(key);
      if (currentSet) {
        currentSet.delete(handlerObj);
        if (currentSet.size === 0) {
          this.domainHandlers.delete(key);
        }
      }
    };
  }

  /**
   * Creates a tRPC v11 compatible subscription for a specific event.
   */
  subscribe<E extends SpecificEventName<TEventMap>>(
    eventName: E,
    filter?: EventFilter<ExtractPayload<TEventMap, E>>
  ): AsyncGenerator<ExtractPayload<TEventMap, E>> {
    const events: ExtractPayload<TEventMap, E>[] = [];
    let resolvers: Array<(value: IteratorResult<ExtractPayload<TEventMap, E>>) => void> = [];
    let isDone = false;

    const unsubscribe = this.on(
      eventName,
      (data) => {
        if (isDone) return;

        if (resolvers.length > 0) {
          const resolve = resolvers.shift();
          if (resolve) {
            resolve({ value: data, done: false });
          }
        } else {
          events.push(data);
        }
      },
      filter
    );

    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next(): Promise<IteratorResult<ExtractPayload<TEventMap, E>, undefined>> {
        if (isDone) {
          return { value: undefined, done: true };
        }

        if (events.length > 0) {
          const event = events.shift();
          if (event !== undefined) {
            return { value: event, done: false };
          }
        }

        return new Promise<IteratorResult<ExtractPayload<TEventMap, E>, undefined>>((resolve) => {
          resolvers.push(resolve);
        });
      },
      async return(): Promise<IteratorResult<ExtractPayload<TEventMap, E>, undefined>> {
        isDone = true;
        unsubscribe();

        for (const resolve of resolvers) {
          resolve({ value: undefined, done: true });
        }
        resolvers = [];

        return { value: undefined, done: true };
      },
      async throw(error: unknown): Promise<IteratorResult<ExtractPayload<TEventMap, E>, undefined>> {
        isDone = true;
        unsubscribe();

        for (const resolve of resolvers) {
          resolve({ value: undefined, done: true });
        }
        resolvers = [];

        throw error;
      },
    };
  }

  /**
   * Creates a tRPC v11 compatible subscription for all events in a domain.
   */
  subscribeDomain<D extends DomainEventName<TEventMap>>(
    domain: D,
    filter?: EventFilter<DomainEvents<TEventMap, D>>
  ): AsyncGenerator<DomainEvents<TEventMap, D>> {
    const events: DomainEvents<TEventMap, D>[] = [];
    let resolvers: Array<(value: IteratorResult<DomainEvents<TEventMap, D>>) => void> = [];
    let isDone = false;

    const unsubscribe = this.onDomain(
      domain,
      (event) => {
        if (isDone) return;

        if (resolvers.length > 0) {
          const resolve = resolvers.shift();
          if (resolve) {
            resolve({ value: event, done: false });
          }
        } else {
          events.push(event);
        }
      },
      filter
    );

    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next(): Promise<IteratorResult<DomainEvents<TEventMap, D>, undefined>> {
        if (isDone) {
          return { value: undefined, done: true };
        }

        // If we have stored events, return one
        if (events.length > 0) {
          const event = events.shift();
          if (event !== undefined) {
            return { value: event, done: false };
          }
        }

        return new Promise<IteratorResult<DomainEvents<TEventMap, D>, undefined>>((resolve) => {
          resolvers.push(resolve);
        });
      },
      async return(): Promise<IteratorResult<DomainEvents<TEventMap, D>, undefined>> {
        isDone = true;
        unsubscribe();

        for (const resolve of resolvers) {
          resolve({ value: undefined, done: true });
        }
        resolvers = [];

        return { value: undefined, done: true };
      },
      async throw(error: unknown): Promise<IteratorResult<DomainEvents<TEventMap, D>, undefined>> {
        isDone = true;
        unsubscribe();

        for (const resolve of resolvers) {
          resolve({ value: undefined, done: true });
        }
        resolvers = [];

        throw error;
      },
    };
  }

  /**
   * Emits an event.
   */
  emit<E extends SpecificEventName<TEventMap>>(
    eventName: E,
    data: ExtractPayload<TEventMap, E>
  ): void {
    if (!eventName.includes(":")) {
      throw new Error("Expected specific event name with format 'domain:event'");
    }

    const specificKey = eventName;
    const specificSet = this.specificHandlers.get(specificKey);
    if (specificSet) {
      for (const { handler, filter } of specificSet) {
        if (!filter || filter(data)) {
          handler(data);
        }
      }
    }

    const parts = eventName.split(":");
    if (parts.length >= 2) {
      const domain = parts[0];
      const spec = parts[1];

      const domainSet = this.domainHandlers.get(domain as DomainEventName<TEventMap>);
      if (domainSet) {
        const domainEvent = { type: spec, data };
        for (const { handler, filter } of domainSet) {
          if (!filter || filter(domainEvent)) {
            handler(domainEvent);
          }
        }
      }
    }
  }

  /**
   * Emits an event to a domain (used less frequently).
   */
  emitDomain<D extends DomainEventName<TEventMap>>(
    domain: D,
    event: DomainEvents<TEventMap, D>
  ): void {
    if (domain.includes(":")) {
      throw new Error("Expected domain name without ':'");
    }

    // Domain-only emission
    const domainSet = this.domainHandlers.get(domain);
    if (domainSet) {
      for (const { handler, filter } of domainSet) {
        if (!filter || filter(event)) {
          handler(event);
        }
      }
    }
  }
}
