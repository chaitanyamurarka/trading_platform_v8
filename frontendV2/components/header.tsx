"use client";

import { useTheme } from "@/hooks/useTheme";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-base-200 p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">EigenKor Trading</h1>
      <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
        {theme === "light" ? (
          <MoonIcon className="h-6 w-6" />
        ) : (
          <SunIcon className="h-6 w-6" />
        )}
      </button>
    </header>
  );
};

export default Header;