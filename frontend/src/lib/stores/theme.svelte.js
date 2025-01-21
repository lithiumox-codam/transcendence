import { browser } from '$app/environment';

function createThemeStore() {
    const defaultTheme = browser ? (localStorage.getItem('theme') || 'system') : 'system';
    let currentTheme = $state(defaultTheme);
    let isDark = $state(false);

    function updateTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('theme', theme);
        updateIsDark();
        applyTheme();
    }

    function updateIsDark() {
        isDark = currentTheme === 'dark' || 
                (currentTheme === 'system' && window?.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    function applyTheme() {
        document.documentElement.classList.toggle('dark', isDark);
        const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
        if (themeColorMetaTag) {
            themeColorMetaTag.setAttribute('content', isDark ? '#222222' : '#ffffff'); // Example colors for dark and light themes
        }
    }

    function toggle() {
        updateTheme(isDark ? 'light' : 'dark');
    }

    // Initial setup
    if (browser) {
        updateIsDark();
        applyTheme();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (currentTheme === 'system') {
                updateIsDark();
                applyTheme();
            }
        });
    }

    return {
        theme: currentTheme,
        isDark,
        toggle
    };
}

export const theme = createThemeStore(); 