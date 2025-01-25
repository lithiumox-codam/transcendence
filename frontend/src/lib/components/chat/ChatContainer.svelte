<script>
    import { clickOutside } from '$lib/utils/clickOutside';
    
    let open = $state(false);
    let sidebarOpen = $state(false);
    let minimized = $state(true); // Start in minimized state
    
    function toggleOpen() {
        if (minimized) {
            // If minimized, expand to full view
            minimized = false;
            open = true;
        } else {
            // If already expanded, toggle open/closed state
            open = !open;
        }
    }
    
    function toggleSidebar() {
        if (open && !minimized) {
            sidebarOpen = !sidebarOpen;
        }
    }
    
    function minimize() {
        // Always go to minimized state when minimize is called
        minimized = true;
        open = false;
        sidebarOpen = false;
    }
</script>

<main 
    class="chat-container" 
    class:closed={minimized} 
    use:clickOutside={toggleOpen}
>
    {#if minimized}
        <button 
            class="minimize-button" 
            onclick={toggleOpen}
        >
            💬
        </button>
    {:else}
        <div 
            class="chat-box" 
            class:round={!open}
        >
            {#if open}
                <div class="chat-content">
                    <div class="chat-header">
                        <h1>Chat Window</h1>
                        <button 
                            class="minimize-chat-button" 
                            onclick={minimize}
                        >
                            —
                        </button>
                    </div>
                    *<!-- Add chat messages and input here -->*
                </div>
            {/if}
            <footer class="chat-footer">
                <button 
                    class="toggle-button" 
                    onclick={toggleOpen}
                >
                    {open ? 'Close Chat' : 'Open Chat'}
                </button>
                {#if open}
                    <button 
                        class="toggle-sidebar-button" 
                        onclick={toggleSidebar}
                    >
                        {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                    </button>
                {/if}
            </footer>
        </div>
        {#if sidebarOpen && open}
            <aside class="chat-sidebar">
                <h2>Past Chats</h2>
                <p>Select a conversation or view user info here.</p>
            </aside>
        {/if}
    {/if}
</main>
    
<style>
    .chat-container {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: all 0.3s ease;
    }
    
    .chat-container.closed {
        transform: scale(0);
        opacity: 0;
        pointer-events: none;
    }
    
    .minimize-button {
        width: 4rem;
        height: 4rem;
        background-color: hsl(var(--primary));
        color: white;
        border: none;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s ease, background 0.3s ease;
    }
    
    .minimize-button:hover {
        transform: scale(1.1);
        background-color: hsl(var(--primary) / 0.9);
    }
    
    .chat-box {
        width: 40vw;
        max-width: 600px;
        height: 60vh;
        background-color: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
    }
    
    .chat-box.round {
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .chat-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    
    .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background-color: hsl(var(--primary));
        color: white;
    }
    
    .chat-header h1 {
        margin: 0;
        font-size: 1.25rem;
    }
    
    .minimize-chat-button {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .minimize-chat-button:hover {
        opacity: 1;
    }
    
    .chat-footer {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background-color: hsl(var(--background-muted));
    }
    
    .toggle-button, .toggle-sidebar-button {
        background: hsl(var(--primary));
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.3s ease;
        font-size: 0.875rem;
    }
    
    .toggle-button:hover, .toggle-sidebar-button:hover {
        background: hsl(var(--primary) / 0.8);
    }
    
    .chat-sidebar {
        position: absolute;
        bottom: 0;
        right: 100%;
        width: 20vw;
        max-width: 300px;
        height: 60vh;
        background-color: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        border-radius: 12px 0 0 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        z-index: 999;
        transition: all 0.3s ease;
        overflow-y: auto;
    }
</style>