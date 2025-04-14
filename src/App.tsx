import { useEffect, useState } from "react";
import Chatbot from "./components/Chatbot.tsx";
import Header from "./components/Header.tsx";

function App() {
  // Initialize theme from localStorage or default to true (dark mode)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme !== null ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    // Update dark mode class based on state
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    // Set the background color on the body element for consistent scrolling
    document.body.className = darkMode ? "bg-dark-background" : "bg-white";

    // Save theme preference to localStorage
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto px-4 bg-white dark:bg-dark-background text-main-text dark:text-dark-text">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      <Chatbot />
    </div>
  );
}

export default App;
