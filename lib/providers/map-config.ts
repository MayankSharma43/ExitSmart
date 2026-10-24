export const PUNE_CENTER: [number, number] = [18.5204, 73.8567];
export const PUNE_DEFAULT_ZOOM = 12;

export const PUNE_BOUNDS: [[number, number], [number, number]] = [
  [18.35, 73.65], // Southwest
  [18.70, 74.10], // Northeast
];

export function getTileLayerConfig() {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (maptilerKey) {
    return {
      url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`,
      attribution:
        '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    };
  }

  return {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };
}

export const ROUTE_COLORS = {
  walk: "#64748b", // slate-500
  bus: "#ea580c", // orange-600
  metro_aqua: "#0284c7", // sky-600 (Aqua line)
  metro_purple: "#7e22ce", // purple-700 (Purple line)
  auto: "#16a34a", // green-600
  shared_auto: "#0d9488", // teal-600
  cab: "#475569", // slate-600
};
