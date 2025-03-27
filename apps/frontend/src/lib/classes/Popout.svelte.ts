// this is a class for the popout it manages what components are shown and what data is passed to them
import type { Component } from "svelte";

interface PopoutSize {
    width: number;
    height: number;
}

interface PopoutPosition {
    x: number;
    y: number;
}

// Only store position per component
interface PopoutState {
    position: PopoutPosition;
}

const DEFAULT_MIN_SIZE: PopoutSize = { width: 300, height: 300 };
const DEFAULT_MAX_SIZE: PopoutSize = { width: 1080, height: 1920 };
const DEFAULT_SIZE: PopoutSize = { width: 400, height: 300 };
const DEFAULT_POSITION: PopoutPosition = { x: 20, y: 20 };

export class Popout {
    shown = $state<boolean>(false);
    component = $state<Component | null>(null);
    minSize = $state<PopoutSize>(DEFAULT_MIN_SIZE);
    maxSize = $state<PopoutSize>(DEFAULT_MAX_SIZE);
    size = $state<PopoutSize>(DEFAULT_SIZE);
    position = $state<PopoutPosition>(DEFAULT_POSITION);
    componentId = $state<string | null>(null);

    constructor() {
        this.loadStateFromStorage();
    }

    show(component: Component, id?: string) {
        this.shown = true;
        this.component = component;
        this.componentId = id || this.getComponentId(component);
        this.loadComponentPosition();
    }

    hide() {
        this.saveComponentPosition();
        this.shown = false;
        this.component = null;
        this.componentId = null;
    }

    setSize(width: number, height: number) {
        width = Math.max(
            this.minSize.width,
            Math.min(width, this.maxSize.width),
        );
        height = Math.max(
            this.minSize.height,
            Math.min(height, this.maxSize.height),
        );

        this.size = { width, height };
        this.saveGlobalSettings();
    }

    setPosition(x: number, y: number) {
        this.position = { x, y };
        this.saveComponentPosition();
    }

    setMinSize(width: number, height: number) {
        this.minSize = { width, height };

        // Adjust current size if needed
        if (this.size.width < width || this.size.height < height) {
            this.size = {
                width: Math.max(this.size.width, width),
                height: Math.max(this.size.height, height),
            };
            this.saveGlobalSettings();
        }
    }

    setMaxSize(width: number, height: number) {
        this.maxSize = { width, height };

        // Adjust current size if needed
        if (this.size.width > width || this.size.height > height) {
            this.size = {
                width: Math.min(this.size.width, width),
                height: Math.min(this.size.height, height),
            };
            this.saveGlobalSettings();
        }
    }

    private getComponentId(component: Component): string {
        return (
            component?.constructor?.name ||
            (typeof component === "function"
                ? component.name
                : "unknown-component")
        );
    }

    private loadComponentPosition() {
        if (!this.componentId) return;

        try {
            const storageKey = `popout-position-${this.componentId}`;
            const storedData = localStorage.getItem(storageKey);

            if (storedData) {
                const state = JSON.parse(storedData) as PopoutState;
                this.position = state.position;
            }
        } catch (error) {
            console.error("Failed to load popout position:", error);
        }
    }

    private saveComponentPosition() {
        if (!this.componentId) return;

        try {
            const state: PopoutState = {
                position: this.position,
            };

            const storageKey = `popout-position-${this.componentId}`;
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (error) {
            console.error("Failed to save popout position:", error);
        }
    }

    private saveGlobalSettings() {
        try {
            localStorage.setItem("popout-size", JSON.stringify(this.size));
            localStorage.setItem("popout-min-size", JSON.stringify(this.minSize));
            localStorage.setItem("popout-max-size", JSON.stringify(this.maxSize));
        } catch (error) {
            console.error("Failed to save popout global settings:", error);
        }
    }

    private loadStateFromStorage() {
        try {
            const sizeData = localStorage.getItem("popout-size");
            const minSizeData = localStorage.getItem("popout-min-size");
            const maxSizeData = localStorage.getItem("popout-max-size");

            if (sizeData) {
                this.size = JSON.parse(sizeData);
            }
            
            if (minSizeData) {
                this.minSize = JSON.parse(minSizeData);
            }

            if (maxSizeData) {
                this.maxSize = JSON.parse(maxSizeData);
            }
        } catch (error) {
            console.error("Failed to load popout configuration:", error);
        }
    }
}
