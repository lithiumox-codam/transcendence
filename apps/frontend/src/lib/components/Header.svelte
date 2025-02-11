<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { i18n } from "$lib/i18n";
    import * as m from "$lib/paraglide/messages.js";
    import type { AvailableLanguageTag } from "$lib/paraglide/runtime";
    import { clickOutside } from "$lib/utils/clickOutside";

    let navItems = [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
    ] as const;

    // Language settings
    let languages: { code: AvailableLanguageTag; flag: string }[] = [
        { code: "en", flag: "🇬🇧" },
        { code: "nl", flag: "🇳🇱" },
    ];

    // Use the first language as the default reactive currentLanguage.
    let languageDropdownOpen = $state(false);
    let showUserDropdown = $state(false);
    let scrolled = $state(false);

    // Switch the current language and close dropdown.
    function switchLanguage(newCode: AvailableLanguageTag) {
        const canonicalPath = i18n.route(page.url.pathname);
        const localisedPath = i18n.resolveRoute(canonicalPath, newCode);
        goto(localisedPath);

        languageDropdownOpen = false;
    }

    // Listen to scroll events: add blur when scrolled down.
    $effect(() => {
        function handleScroll() {
            scrolled = window.scrollY > 50;
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    });
</script>

<header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    class:backdrop-blur-lg={scrolled}
    class:shadow-lg={scrolled}
>
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <!-- Typed Navigation -->
        <nav class="flex space-x-6">
            {#each navItems as item (item.href)}
                <a href={item.href} class="text-white hover:underline">
                    {item.label}
                </a>
            {/each}
        </nav>

        <div class="flex items-center">
            <!-- Language Changer Dropdown -->
            <div class="relative">
                <button
                    class="flex items-center text-white hover:bg-gray-700 px-3 py-1 rounded"
                    onclick={() =>
                        (languageDropdownOpen = !languageDropdownOpen)}
                >
                    <span class="mr-2 text-xl">{m.flag()}</span>
                </button>
                {#if languageDropdownOpen}
                    <div
                        class="absolute right-0 mt-2 bg-black border border-white/30 rounded shadow-md flex flex-col"
                    >
                        {#each languages as lang (lang.code)}
                            <button
                                class="text-white hover:bg-gray-700 px-3 py-1"
                                onclick={() => switchLanguage(lang.code)}
                            >
                                <span class="mr-2 text-xl">{lang.flag}</span>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- User Settings Dropdown (inspired by shadcn) -->
            <div class="relative">
                <button
                    class="flex items-center text-white hover:bg-gray-700 px-3 py-1 rounded"
                    onclick={() => (showUserDropdown = !showUserDropdown)}
                >
                    <span>User</span>
                </button>
                {#if showUserDropdown}
                    <div use:clickOutside={() => (showUserDropdown = false)}>
                        class="absolute right-0 mt-2 bg-black border
                        border-white/30 rounded shadow-md flex flex-col" >
                        <a
                            href="/profile"
                            class="text-white hover:bg-gray-700 px-3 py-1"
                            >Profile</a
                        >
                        <a
                            href="/settings"
                            class="text-white hover:bg-gray-700 px-3 py-1"
                            >Settings</a
                        >
                        <a
                            href="/logout"
                            class="text-white hover:bg-gray-700 px-3 py-1"
                            >Logout</a
                        >
                    </div>
                {/if}
            </div>
        </div>
    </div>
</header>

<style>
    /* Optional: Additional styling to ensure header content is visible */
    header {
        /* Fallback background when not scrolled */
        background-color: transparent;
    }
</style>
