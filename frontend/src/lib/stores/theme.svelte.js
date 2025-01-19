import { browser } from '$app/environment';

function createThemeStore() {
    const defaultTheme = browser ? (localStorage.getItem('theme') || 'system') : 'system';
    let currentTheme = $state(defaultTheme);
    let isDark = $state(false);

    function updateTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('theme', theme);
        updateIsDark();
        document.documentElement.classList.toggle('dark', isDark);
    }

    function updateIsDark() {
        isDark = currentTheme === 'dark' || 
                (currentTheme === 'system' && window?.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    function toggle() {
        updateTheme(isDark ? 'light' : 'dark');
    }

    // Initial setup
    if (browser) {
        updateIsDark();
        document.documentElement.classList.toggle('dark', isDark);
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (currentTheme === 'system') {
                updateIsDark();
                document.documentElement.classList.toggle('dark', isDark);
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