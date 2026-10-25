"use client";

import React from "react";
import Link from "next/link";
import { Mark } from "./Footer";

export default function Header() {
  const handleOpenAssumptions = () => {
    window.dispatchEvent(new CustomEvent("open-assumptions"));
  };

  return (
    <header className="floating-header-pill">
      {/* Brand: ExitSmart / Pune */}
      <Link className="brand-pill" href="/">
        <span className="brand-pill-mark">
          <Mark />
        </span>
        <span className="brand-pill-name">
          Exit<span>Smart</span>
        </span>
        <span className="brand-pill-city">Pune</span>
      </Link>

      {/* Centered Navigation Links */}
      <nav className="nav-pill-links">
        <a href="/#how-it-works">How it works</a>
        <a href="/#popular-routes">Corridors</a>
        <a href="/#rto-meter">RTO Fare Meter</a>
        <button type="button" onClick={handleOpenAssumptions}>
          Assumptions
        </button>
      </nav>

      {/* Right Side Pill Badge & Action */}
      <div className="pill-actions">
        <div className="status-pill">
          <span className="status-dot"></span>
          <span>Offline Ready</span>
          <span className="status-sep">•</span>
          <span className="status-sub">Pune</span>
        </div>
        <a href="/#planner" className="plan-pill-btn">
          Plan Journey
        </a>
      </div>
    </header>
  );
}

