<script lang="ts">
    import { fade } from "svelte/transition";
    import type { Popout } from "$lib/classes/Popout.svelte";
    import { getContext } from "svelte";
    import { clickOutside } from "$lib/utils/clickOutside";

    const popout = getContext<Popout>("popout");

    // State for dragging
    let dragging = $state(false);
    let dragStartX = $state(0);
    let dragStartY = $state(0);
    let dragStartPosX = $state(0);
    let dragStartPosY = $state(0);

    // State for resizing
    let resizing = $state(false);
    let resizeStartX = $state(0);
    let resizeStartY = $state(0);
    let resizeStartWidth = $state(0);
    let resizeStartHeight = $state(0);
    let resizeStartPosX = $state(0);
    let resizeStartPosY = $state(0);
    let resizeDirection = $state<{
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    }>({ top: false, right: false, bottom: false, left: false });

    // Handle popout dragging
    function startDrag(event: MouseEvent) {
        if (!popout.shown) return;

        dragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragStartPosX = popout.position.x;
        dragStartPosY = popout.position.y;

        // Prevent default behaviors
        event.preventDefault();
    }

    function handleDrag(event: MouseEvent) {
        if (!dragging) return;

        const deltaX = event.clientX - dragStartX;
        const deltaY = event.clientY - dragStartY;

        // Update the position using the Popout class method
        popout.setPosition(dragStartPosX + deltaX, dragStartPosY + deltaY);
    }

    function stopDrag() {
        dragging = false;
    }

    // Handle popout resizing
    function startResize(
        event: MouseEvent,
        directions: {
            top?: boolean;
            right?: boolean;
            bottom?: boolean;
            left?: boolean;
        },
    ) {
        resizing = true;
        resizeStartX = event.clientX;
        resizeStartY = event.clientY;
        resizeStartWidth = popout.size.width;
        resizeStartHeight = popout.size.height;
        resizeStartPosX = popout.position.x;
        resizeStartPosY = popout.position.y;

        resizeDirection = {
            top: !!directions.top,
            right: !!directions.right,
            bottom: !!directions.bottom,
            left: !!directions.left,
        };

        // Prevent default behaviors
        event.preventDefault();
    }

    function handleResize(event: MouseEvent) {
        if (!resizing) return;

        const deltaX = event.clientX - resizeStartX;
        const deltaY = event.clientY - resizeStartY;

        let newWidth = resizeStartWidth;
        let newHeight = resizeStartHeight;
        let newX = resizeStartPosX;
        let newY = resizeStartPosY;

        // Handle horizontal resizing
        if (resizeDirection.right) {
            newWidth = resizeStartWidth + deltaX;
        } else if (resizeDirection.left) {
            newWidth = resizeStartWidth - deltaX;
            if (newWidth >= popout.minSize.width) {
                newX = resizeStartPosX + deltaX;
            } else {
                newWidth = popout.minSize.width;
                newX =
                    resizeStartPosX + (resizeStartWidth - popout.minSize.width);
            }
        }

        // Handle vertical resizing
        if (resizeDirection.bottom) {
            newHeight = resizeStartHeight + deltaY;
        } else if (resizeDirection.top) {
            newHeight = resizeStartHeight - deltaY;
            if (newHeight >= popout.minSize.height) {
                newY = resizeStartPosY + deltaY;
            } else {
                newHeight = popout.minSize.height;
                newY =
                    resizeStartPosY +
                    (resizeStartHeight - popout.minSize.height);
            }
        }

        // Apply changes
        popout.setSize(newWidth, newHeight);
        popout.setPosition(newX, newY);
    }

    function stopResize() {
        resizing = false;
    }

    function handleClose() {
        popout.hide();
    }

    // Handle clicking outside the popout
    function handleClickOutsideAction() {
        popout.hide();
    }

    $effect(() => {
        return () => {
            popout.hide();
        };
    });
</script>

<svelte:window
    onmousemove={dragging || resizing
        ? dragging
            ? handleDrag
            : handleResize
        : null}
    onmouseup={dragging ? stopDrag : resizing ? stopResize : null}
/>

{#if popout.shown && popout.component}
    <div
        class="fixed top-0 left-0 w-screen h-screen z-40 bg-black/20"
        transition:fade={{ duration: 200 }}
        role="presentation"
    >
        <div
            use:clickOutside={handleClickOutsideAction}
            role="dialog"
            aria-labelledby="popout-title"
            style="position: absolute; top: {popout.position.y}px; left: {popout
                .position.x}px; width: {popout.size.width}px; height: {popout
                .size.height}px;"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
        >
            <!-- Header with drag functionality -->
            <header
                class="popout-header flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 cursor-move"
                role="toolbar"
                aria-label="Popout window controls"
            >
                <button
                    class="flex-1 h-full drag-handle text-left"
                    onmousedown={startDrag}
                    aria-label="Drag to move window"
                    type="button"
                >
                    <span class="sr-only">Drag to move</span>
                </button>
                
                <button
                    class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    onclick={handleClose}
                    aria-label="Close"
                    type="button"
                >
                    <svg
                        class="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </header>

            <!-- Content container -->
            <div class="flex-1 overflow-auto" role="region">
                {#if popout.component}
                    <popout.component />
                {/if}
            </div>

            <!-- Resize handles -->
            <button
                class="absolute top-0 left-0 right-0 h-1 hover:h-2 opacity-0 hover:opacity-100"
                style="cursor: ns-resize;"
                onmousedown={(e) => startResize(e, { top: true })}
                aria-label="Resize from top"
                type="button"
            ></button>

            <button
                class="absolute top-0 right-0 bottom-0 w-1 hover:w-2 opacity-0 hover:opacity-100"
                style="cursor: ew-resize;"
                onmousedown={(e) => startResize(e, { right: true })}
                aria-label="Resize from right"
                type="button"
            ></button>

            <button
                class="absolute bottom-0 left-0 right-0 h-1 hover:h-2 opacity-0 hover:opacity-100"
                style="cursor: ns-resize;"
                onmousedown={(e) => startResize(e, { bottom: true })}
                aria-label="Resize from bottom"
                type="button"
            ></button>

            <button
                class="absolute top-0 left-0 bottom-0 w-1 hover:w-2 opacity-0 hover:opacity-100"
                style="cursor: ew-resize;"
                onmousedown={(e) => startResize(e, { left: true })}
                aria-label="Resize from left"
                type="button"
            ></button>

            <button
                class="absolute top-0 left-0 w-4 h-4 opacity-0 hover:opacity-100"
                style="cursor: nw-resize;"
                onmousedown={(e) => startResize(e, { top: true, left: true })}
                aria-label="Resize from top-left"
                type="button"
            ></button>

            <button
                class="absolute top-0 right-0 w-4 h-4 opacity-0 hover:opacity-100"
                style="cursor: ne-resize;"
                onmousedown={(e) => startResize(e, { top: true, right: true })}
                aria-label="Resize from top-right"
                type="button"
            ></button>

            <button
                class="absolute bottom-0 right-0 w-4 h-4 opacity-0 hover:opacity-100"
                style="cursor: se-resize;"
                onmousedown={(e) =>
                    startResize(e, { bottom: true, right: true })}
                aria-label="Resize from bottom-right"
                type="button"
            >
                <svg
                    class="w-full h-full text-gray-500 dark:text-gray-400"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        d="M11 9h1v1h-1v-1zm2 2h1v1h-1v-1zm-2 0h1v1h-1v-1zm2-2h1v1h-1v-1z"
                    />
                </svg>
            </button>

            <button
                class="absolute bottom-0 left-0 w-4 h-4 opacity-0 hover:opacity-100"
                style="cursor: sw-resize;"
                onmousedown={(e) =>
                    startResize(e, { bottom: true, left: true })}
                aria-label="Resize from bottom-left"
                type="button"
            ></button>
        </div>
    </div>
{/if}
