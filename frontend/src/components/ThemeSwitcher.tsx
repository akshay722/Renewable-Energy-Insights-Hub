import { useTheme } from "../context/ThemeContext";

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  // Theme icons
  const lightIcon = "☀️";
  const darkIcon = "🌙";

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-10 focus:outline-none transition-colors duration-200"
      onClick={toggleTheme}
      style={{ 
        color: 'var(--color-text)',
        backgroundColor: theme === "light" ? "transparent" : "rgba(255, 255, 255, 0.1)"
      }}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <span className="mr-2">{theme === "light" ? darkIcon : lightIcon}</span>
      <span className="hidden md:inline">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
};

export default ThemeSwitcher;
