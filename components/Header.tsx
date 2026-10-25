"use client";

import React from "react";
import Link from "next/link";
import { BrandMark } from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const handleOpenAssumptions = () => {
    window.dispatchEvent(new CustomEvent("open-assumptions"));
  };

  return (
    <header className="floating-header-pill">
      {/* Brand: ExitSmart / Pune with Authentic BrandMark */}
      <Link className="brand-pill" href="/" title="ExitSmart - Home">
        <BrandMark size={32} />
        <span className="brand-pill-name">
          Exit<span>Smart</span>
        </span>
        <span className="brand-pill-city">Pune</span>
      </Link>

      {/* Centered Navigation Links pointing to Dedicated Sub-Pages */}
      <nav className="nav-pill-links">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/corridors">Corridors</Link>
        <Link href="/rto-fare-meter">RTO Fare Meter</Link>
        <button type="button" onClick={handleOpenAssumptions}>
          Assumptions
        </button>
      </nav>

      {/* Right Side Theme Toggle, Pill Badge & Action */}
      <div className="pill-actions">
        <ThemeToggle />

        <div className="status-pill">
          <span className="status-dot"></span>
          <span>Offline Ready</span>
          <span className="status-sep">•</span>
          <span className="status-sub">Pune</span>
        </div>

        <Link href="/#planner" className="plan-pill-btn">
          Plan Journey
        </Link>
      </div>
    </header>
  );
}

