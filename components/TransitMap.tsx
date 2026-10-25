export type Category = "cheapest" | "fastest" | "convenient";

interface TransitMapProps {
  routeKey: string;
  category: Category;
  origin: string;
  destination: string;
  entry?: string;
  exit?: string;
  interactive?: boolean;
  onEntryClick?: () => void;
  onExitClick?: () => void;
}

const routePaths: Record<string, string> = {
  kharadi: "M 62 325 C 174 315 184 250 280 245 S 410 220 555 95",
  viman: "M 62 325 C 144 300 226 250 300 214 S 420 200 555 140",
  baner: "M 62 325 C 145 325 158 240 252 230 S 385 280 555 90"
};

const colors: Record<Category, string> = {
  cheapest: "#1F2A44",
  fastest: "#C6A75E",
  convenient: "#C6A75E"
};

export default function TransitMap({
  routeKey,
  category,
  origin,
  destination,
  entry,
  exit,
  interactive = false,
  onEntryClick,
  onExitClick
}: TransitMapProps) {
  const path = routePaths[routeKey] || routePaths.kharadi;
  const color = colors[category];
  return (
    <div className="transit-map" aria-label="Illustrative route map, not to scale">
      <svg className="transit-map__svg" viewBox="0 0 640 400" role="img" aria-hidden="true">
        <defs>
          <pattern id={"grid-" + routeKey} width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M 42 0 L 0 0 0 42" fill="none" stroke="rgba(198, 167, 94, .08)" strokeWidth="1" />
          </pattern>
          <filter id="route-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="route-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#C6A75E" />
            <stop offset="1" stopColor={color} />
          </linearGradient>
        </defs>
        <rect width="640" height="400" fill="#E8DCC8" />
        <rect width="640" height="400" fill={"url(#grid-" + routeKey + ")"} />
        <g fill="none" stroke="#F3E9D9" strokeWidth="3" opacity=".62" strokeLinecap="round">
          <path d="M-20 95 C78 118 122 47 222 76 S378 144 481 75 610 81 675 40" />
          <path d="M-20 171 C71 139 149 176 240 135 S396 171 482 122 603 129 664 108" />
          <path d="M-20 244 C69 217 140 257 231 215 S401 242 493 195 598 204 668 175" />
          <path d="M-20 362 C88 324 164 371 261 326 S425 347 512 299 610 308 672 277" />
          <path d="M96 -20 C114 82 72 118 105 200 S116 317 77 425" />
          <path d="M218 -20 C190 67 250 111 220 193 S246 320 208 425" />
          <path d="M356 -20 C327 65 390 123 354 195 S380 330 342 425" />
          <path d="M500 -20 C470 75 530 120 496 203 S524 331 480 425" />
        </g>
        <g fill="none" stroke="#C6A75E" strokeWidth="1.5" opacity=".36">
          <path d="M18 35 L185 400 M300 15 L430 400 M600 55 L265 398 M0 290 L633 235 M35 122 L640 360" />
          <path d="M48 200 L440 42 M180 18 L568 322 M36 360 L588 158" />
        </g>
        <path d={path} fill="none" stroke="url(#route-gradient)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" opacity=".16" filter="url(#route-glow)" />
        <path d={path} fill="none" stroke="url(#route-gradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="62" cy="325" r="15" fill="#E8DCC8" stroke="#1F2A44" strokeWidth="4" />
        <circle cx="62" cy="325" r="5" fill="#1F2A44" />
        <circle cx="555" cy={routeKey === "baner" ? "90" : routeKey === "viman" ? "140" : "95"} r="16" fill="#E8DCC8" stroke={color} strokeWidth="4" />
        <circle cx="555" cy={routeKey === "baner" ? "90" : routeKey === "viman" ? "140" : "95"} r="5" fill={color} />
        <circle cx="280" cy="245" r="5" fill="#C6A75E" opacity=".85" />
        <circle cx="420" cy="210" r="4" fill="#C6A75E" opacity=".75" />
      </svg>
      <div className="map-label map-label--origin">
        <span className="map-label__eyebrow">START</span>
        <strong>{origin}</strong>
      </div>
      <div className="map-label map-label--destination">
        <span className="map-label__eyebrow">DESTINATION</span>
        <strong>{destination}</strong>
      </div>
      {interactive && (
        <>
          <button type="button" className="map-stop map-stop--entry" onClick={onEntryClick} aria-label="Change entry point">
            <span className="map-stop__dot" />
            <span><small>ENTRY</small><strong>{entry || "Choose entry"}</strong></span>
          </button>
          <button type="button" className="map-stop map-stop--exit" onClick={onExitClick} aria-label="Change exit point">
            <span className="map-stop__dot map-stop__dot--violet" />
            <span><small>EXIT</small><strong>{exit || "Choose exit"}</strong></span>
          </button>
        </>
      )}
      <div className="map-scale"><span /> <span>Illustrative map · not to scale</span></div>
    </div>
  );
}
