"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${isDark ? "light" : "dark"} theme`} title={`Switch to ${isDark ? "light" : "dark"} theme`}>
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
