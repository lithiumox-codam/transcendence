<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import type { UserClass } from "$lib/classes/User.svelte";
    import { i18n } from "$lib/i18n";
    import * as m from "$lib/paraglide/messages.js";
    import type { AvailableLanguageTag } from "$lib/paraglide/runtime";
    import { clickOutside } from "$lib/utils/clickOutside";
    import { getContext } from "svelte";

    let navItems = [
        { label: "Home", href: "/" },
        { label: "Chat", href: "/chat" },
        { label: "User", href: "/user" },
    ] as const;

    let languages: { code: AvailableLanguageTag; flag: string }[] = [
        { code: "en", flag: "🇬🇧" },
        { code: "nl", flag: "🇳🇱" },
    ];

    let languageDropdownOpen = $state(false);
    let showUserDropdown = $state(false);

    function switchLanguage(newCode: AvailableLanguageTag) {
        const canonicalPath = i18n.route(page.url.pathname);
        const localisedPath = i18n.resolveRoute(canonicalPath, newCode);
        goto(localisedPath);
        languageDropdownOpen = false;
    }
</script>

<header class="bg-black bg-opacity-50">
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <!-- Navigation -->
        <nav class="flex space-x-6">
            {#each navItems as item (item.href)}
                <a href={item.href} class="text-white hover:underline">
                    {item.label}
                </a>
            {/each}
        </nav>

        <div class="flex items-center space-x-4">
            <!-- Language Dropdown -->
            <div class="relative">
                <button
                    class="flex items-center text-white hover:bg-gray-700 px-3 py-1 rounded focus:outline-none"
                    onclick={() =>
                        (languageDropdownOpen = !languageDropdownOpen)}
                >
                    <span class="mr-2 text-xl">{m.flag()}</span>
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.25 7.5l4.5 4.5 4.5-4.5z" />
                    </svg>
                </button>
                {#if languageDropdownOpen}
                    <div
                        class="absolute right-0 mt-2 w-40 bg-black border border-white/30 rounded shadow-md"
                    >
                        {#each languages as lang (lang.code)}
                            <button
                                class="w-full text-left text-white hover:bg-gray-700 px-4 py-2"
                                onclick={() => switchLanguage(lang.code)}
                            >
                                <span class="mr-2">{lang.flag}</span>
                                {lang.code.toUpperCase()}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- User Settings Dropdown -->
        </div>
    </div>
</header>

<style>
    header {
        background-color: rgba(0, 0, 0, 0.5);
    }
</style>
