export function initTheme() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const checkAndApplyTheme = () => {
        if (mediaQuery.matches) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    // Apply initially
    checkAndApplyTheme();

    // Listen for changes
    mediaQuery.addEventListener("change", checkAndApplyTheme);

    // Return cleanup function
    return () => {
        mediaQuery.removeEventListener("change", checkAndApplyTheme);
    };
}
