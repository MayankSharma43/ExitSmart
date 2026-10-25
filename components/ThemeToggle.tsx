"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("exitsmart-theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      applyTheme(initial);
    }
  }, []);

  const applyTheme = (t: "light" | "dark") => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("exitsmart-theme", nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new CustomEvent("exitsmart-theme-change", { detail: nextTheme }));
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="w-9 h-9 rounded-full bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/15 flex items-center justify-center text-xs opacity-60"
        aria-label="Toggle dark mode"
      >
        <span className="w-4 h-4 rounded-full bg-amber-400/50" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        relative w-9 h-9 rounded-full
        bg-white/55 dark:bg-[#1E1B17]/85
        border border-white/80 dark:border-white/15
        shadow-xs hover:shadow-md
        flex items-center justify-center
        text-[#221B16] dark:text-[#F9F6F0]
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
      `}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          className={`h-4 w-4 text-[#D9A441] transition-all duration-300 absolute ${
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`h-4 w-4 text-[#ECCB8D] transition-all duration-300 absolute ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
    </button>
  );
}
