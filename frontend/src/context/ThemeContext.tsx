import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Theme types
export type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Get saved theme from localStorage or default to 'light'
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as ThemeType) || "dark";
  });

  // Update theme class on the document element
  useEffect(() => {
    // Remove any existing theme classes
    document.documentElement.classList.remove("theme-light", "theme-dark");

    // Add the current theme class
    document.documentElement.classList.add(`theme-${theme}`);

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Set theme function
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
