import { useEffect } from "react";
import Chatbot from "./components/Chatbot.tsx";

function App() {
  useEffect(() => {
    // Add dark mode class to the document
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto px-4 bg-dark-background text-dark-text">
      <header className="sticky top-0 shrink-0 z-20 bg-dark-background border-b border-dark-surface/70">
        <div className="flex flex-col h-full w-full gap-1 pt-4 pb-2">
          <h1 className="font-urbanist text-[1.65rem] font-semibold text-dark-text">
            Mitigator AI Assistant
          </h1>
        </div>
      </header>
      <Chatbot />
    </div>
  );
}

export default App;
