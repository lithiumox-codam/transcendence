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

// Constants
const DEFAULT_MIN_SIZE: PopoutSize = { width: 1920, height: 1080 };
const DEFAULT_MAX_SIZE: PopoutSize = { width: 2160, height: 1440 };
const DEFAULT_SIZE: PopoutSize = { width: 600, height: 850 };
const DEFAULT_POSITION: PopoutPosition = { x: 20, y: 20 };
const NAVBAR_HEIGHT = 80; // Estimated height including padding
const NAVBAR_MARGIN = 20; // 5rem converted to px approximation
const POPOUT_MARGIN = 20; // Equal spacing from edges

export class Popout {
	shown = $state<boolean>(false);
	component = $state<Component | null>(null);
	minSize = $state<PopoutSize>(DEFAULT_MIN_SIZE);
	maxSize = $state<PopoutSize>(DEFAULT_MAX_SIZE);
	size = $state<PopoutSize>(DEFAULT_SIZE);
	position = $state<PopoutPosition>(DEFAULT_POSITION);
	private resizeHandler: (() => void) | null = null;
	private hasCustomPosition = $state<boolean>(false);

	constructor() {
		// Load saved state from localStorage first
		this.loadStateFromStorage();

		// Check if we have a position saved in localStorage
		this.hasCustomPosition = this.checkForSavedPosition();

		// Set up resize handler
		this.resizeHandler = this.adjustToWindow.bind(this);

		// Only calculate initial position if no custom position exists
		if (!this.hasCustomPosition) {
			this.calculateInitialPosition();
		}

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

	private checkForSavedPosition(): boolean {
		if (typeof localStorage === "undefined") return false;

		try {
			const savedPosition = localStorage.getItem("popout-position");
			return savedPosition !== null;
		} catch (error) {
			console.error("Failed to check for saved popout position:", error);
			return false;
		}
	}

	private calculateInitialPosition() {
		if (typeof window === "undefined") return;

		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		// Position to right side with margin, and above navbar with margin
		const x = Math.max(
			POPOUT_MARGIN,
			windowWidth - this.size.width - POPOUT_MARGIN,
		);
		const y = Math.max(
			POPOUT_MARGIN,
			windowHeight -
			this.size.height -
			NAVBAR_HEIGHT -
			NAVBAR_MARGIN -
			POPOUT_MARGIN,
		);

		this.position = { x, y };
	}

	show(component: Component) {
		this.component = component;
		this.shown = true;

		// Only recalculate position when showing if no custom position is set
		if (!this.hasCustomPosition) {
			this.calculateInitialPosition();
		} else {
			// If we have a custom position, still ensure it's valid for current screen
			this.adjustToWindow();
		}
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
		this.hasCustomPosition = true; // Mark that user has set a custom position
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

		// Calculate available space, accounting for navbar
		const availableHeight =
			windowHeight - NAVBAR_HEIGHT - NAVBAR_MARGIN - POPOUT_MARGIN;

		// Limit size to window dimensions
		const width = Math.min(
			this.size.width,
			windowWidth - 2 * POPOUT_MARGIN,
		);
		const height = Math.min(
			this.size.height,
			availableHeight - POPOUT_MARGIN,
		);

		// Keep position within visible area
		let x = this.position.x;
		let y = this.position.y;

		// Adjust if popout would be outside right edge
		if (x + width > windowWidth - POPOUT_MARGIN) {
			x = Math.max(POPOUT_MARGIN, windowWidth - width - POPOUT_MARGIN);
		}

		// Adjust if popout would be outside left edge
		if (x < POPOUT_MARGIN) {
			x = POPOUT_MARGIN;
		}

		// Adjust if popout would be outside bottom edge (accounting for navbar)
		if (y + height > availableHeight) {
			y = Math.max(POPOUT_MARGIN, availableHeight - height);
		}

		// Adjust if popout would be outside top edge
		if (y < POPOUT_MARGIN) {
			y = POPOUT_MARGIN;
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
