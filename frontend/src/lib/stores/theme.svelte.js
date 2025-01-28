import { browser } from '$app/environment';

function createThemeStore() {
    const defaultTheme = browser ? localStorage.getItem('theme') || 'system' : 'system';
    let currentTheme = $state(defaultTheme);

    function updateTheme(theme) {
        currentTheme = theme;
        if (browser) localStorage.setItem('theme', theme);
        applyTheme();
    }

    const isDark = () => browser && (currentTheme === 'dark' || (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));

	function applyTheme() {
		if (browser) {
		    document.documentElement.classList.toggle('dark', isDark());
		    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
		    if (themeColorMetaTag) {
			    themeColorMetaTag.setAttribute('content', isDark() ? '#222222' : '#ffffff'); // Example colors for dark and light themes
		    }
		}
	}

    function toggle() {
        updateTheme(isDark() ? 'light' : 'dark');
    }

    // Initial setup
    if (browser) {
        applyTheme();
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (currentTheme === 'system') {
				applyTheme();
			}
		});
    }

    return {
        theme: currentTheme,
		isDark,
        toggle,
    };
}

export const theme = createThemeStore();