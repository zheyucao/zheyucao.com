type ThemeMode = "light" | "dark" | "system";

export function initTheme(defaultTheme: ThemeMode = "system") {
  if (defaultTheme === "dark") {
    document.documentElement.classList.add("dark");
    return () => {};
  }

  if (defaultTheme === "light") {
    document.documentElement.classList.remove("dark");
    return () => {};
  }

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
