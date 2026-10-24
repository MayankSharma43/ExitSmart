"use client";

import React from "react";
import Link from "next/link";

export default function Header() {
  const handleOpenAssumptions = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-assumptions"));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-sm">
            ES
          </span>
          <div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              Exit<span className="text-blue-600">Smart</span>
            </span>
            <span className="ml-1.5 hidden rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 sm:inline">
              Pune Transit
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="hidden items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-700 font-medium sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Metro + PMPML + Auto
          </span>
          <button
            type="button"
            onClick={handleOpenAssumptions}
            className="font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            How we estimate
          </button>
        </div>
      </div>
    </header>
  );
}
