import type { Component } from "svelte";
import { onDestroy } from "svelte";

interface PopoutSize {
    width: number;
    height: number;
}

interface PopoutPosition {
    x: number;
    y: number;
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
    private resizeHandler: (() => void) | null = null;

    constructor() {
        this.loadStateFromStorage();

        // Set up resize handler
        this.resizeHandler = this.adjustToWindow.bind(this);

        // Initial adjustment
        this.adjustToWindow();

        // Watch for window resize
        if (typeof window !== "undefined") {
            window.addEventListener("resize", this.resizeHandler);

            // Cleanup on destroy
            onDestroy(() => {
                if (this.resizeHandler) {
                    window.removeEventListener("resize", this.resizeHandler);
                }
            });
        }
    }

    show(component: Component) {
        this.component = component;
        this.shown = true;
        this.adjustToWindow();
    }

    hide() {
        this.shown = false;
        this.component = null;
    }

    setSize(width: number, height: number) {
        const newWidth = Math.max(
            this.minSize.width,
            Math.min(width, this.maxSize.width),
        );
        const newHeight = Math.max(
            this.minSize.height,
            Math.min(height, this.maxSize.height),
        );

        this.size = { width: newWidth, height: newHeight };
        this.adjustToWindow();
        this.saveSettings();
    }

    setPosition(x: number, y: number) {
        this.position = { x, y };
        this.adjustToWindow();
        this.saveSettings();
    }

    setMinSize(width: number, height: number) {
        this.minSize = { width, height };

        // Adjust current size if needed
        if (this.size.width < width || this.size.height < height) {
            this.size = {
                width: Math.max(this.size.width, width),
                height: Math.max(this.size.height, height),
            };
        }
        this.adjustToWindow();
        this.saveSettings();
    }

    setMaxSize(width: number, height: number) {
        this.maxSize = { width, height };

        // Adjust current size if needed
        if (this.size.width > width || this.size.height > height) {
            this.size = {
                width: Math.min(this.size.width, width),
                height: Math.min(this.size.height, height),
            };
        }
        this.adjustToWindow();
        this.saveSettings();
    }

    adjustToWindow() {
        if (typeof window === "undefined" || !this.shown) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Limit size to window dimensions if needed
        const width = Math.min(this.size.width, windowWidth);
        const height = Math.min(this.size.height, windowHeight);

        // Keep position within visible area
        let x = this.position.x;
        let y = this.position.y;

        // Adjust if popout would be outside right edge
        if (x + width > windowWidth) {
            x = Math.max(0, windowWidth - width);
        }

        // Adjust if popout would be outside bottom edge
        if (y + height > windowHeight) {
            y = Math.max(0, windowHeight - height);
        }

        // Update values if they changed
        if (width !== this.size.width || height !== this.size.height) {
            this.size = { width, height };
        }

        if (x !== this.position.x || y !== this.position.y) {
            this.position = { x, y };
        }
    }

    private saveSettings() {
        try {
            localStorage.setItem(
                "popout-position",
                JSON.stringify(this.position),
            );
            localStorage.setItem("popout-size", JSON.stringify(this.size));
            localStorage.setItem(
                "popout-min-size",
                JSON.stringify(this.minSize),
            );
            localStorage.setItem(
                "popout-max-size",
                JSON.stringify(this.maxSize),
            );
        } catch (error) {
            console.error("Failed to save popout settings:", error);
        }
    }

    private loadStateFromStorage() {
        try {
            const positionData = localStorage.getItem("popout-position");
            const sizeData = localStorage.getItem("popout-size");
            const minSizeData = localStorage.getItem("popout-min-size");
            const maxSizeData = localStorage.getItem("popout-max-size");

            if (positionData) {
                this.position = JSON.parse(positionData);
            }

            if (sizeData) {
                this.size = JSON.parse(sizeData);
            }

            if (minSizeData) {
                this.minSize = JSON.parse(minSizeData);
            }

            if (maxSizeData) {
                this.maxSize = JSON.parse(maxSizeData);
            }

            // Ensure size is within min/max constraints
            this.size = {
                width: Math.max(
                    this.minSize.width,
                    Math.min(this.size.width, this.maxSize.width),
                ),
                height: Math.max(
                    this.minSize.height,
                    Math.min(this.size.height, this.maxSize.height),
                ),
            };
        } catch (error) {
            console.error("Failed to load popout configuration:", error);
            // If loading fails, use the defaults
            this.position = { ...DEFAULT_POSITION };
            this.size = { ...DEFAULT_SIZE };
            this.minSize = { ...DEFAULT_MIN_SIZE };
            this.maxSize = { ...DEFAULT_MAX_SIZE };
        }
    }
}
