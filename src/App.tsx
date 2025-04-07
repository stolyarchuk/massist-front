import { useEffect, useState } from "react";
import Chatbot from "./components/Chatbot.tsx";

function App() {
  // Initialize theme from localStorage or default to true (dark mode)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
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
      <header className="sticky top-0 shrink-0 z-20 bg-white border-b border-gray-200 dark:bg-dark-background dark:border-dark-surface/70">
        <div className="flex flex-col h-full w-full gap-1 pt-4 pb-2">
          <div className="flex justify-between items-center">
            <h1 className="font-urbanist text-[1.65rem] font-semibold text-main-text dark:text-dark-text">
              Mitigator AI Assistant
            </h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue dark:bg-dark-primary/20 dark:hover:bg-dark-primary/30 dark:text-dark-primary transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
      <Chatbot />
    </div>
  );
}

export default App;
