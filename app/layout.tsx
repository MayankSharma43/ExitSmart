import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "ExitSmart | Pune Smart Last-Mile & Transit Optimizer",
  description:
    "Door-to-door transit intelligence for Pune commuters. Optimizing entry and exit stops across Metro, PMPML, Autos, and Cabs.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Header />

        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              ExitSmart &bull; Door-to-Door Multimodal Transit Optimizer &bull; Whole Pune Coverage
            </div>
            <div className="text-[11px] text-slate-400">
              Verified Maha Metro Slabs &bull; Maharashtra RTO Auto Formula &bull; OSM Stack
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
