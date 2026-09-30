import type { MediaItem } from "@/types/admin";

const seeds = [
  { id: 1015, name: "ganga-ghat-varanasi.jpg", by: "सलीम अंसारी" },
  { id: 1024, name: "monsoon-session-parliament.jpg", by: "अनन्या शर्मा" },
  { id: 1035, name: "stadium-night-match.jpg", by: "रोहित वर्मा" },
  { id: 1043, name: "market-rally-graph.jpg", by: "प्रिया नायर" },
  { id: 1056, name: "film-city-set.jpg", by: "मीरा कपूर" },
  { id: 1062, name: "ev-launch-delhi.jpg", by: "अमित रस्तोगी" },
  { id: 1074, name: "farmers-protest-wide.jpg", by: "सलीम अंसारी" },
  { id: 1080, name: "metro-line-inauguration.jpg", by: "विक्रम सिंह" },
  { id: 110, name: "himalaya-landslide.jpg", by: "सलीम अंसारी" },
  { id: 128, name: "startup-office-bengaluru.jpg", by: "प्रिया नायर" },
  { id: 142, name: "award-night-red-carpet.jpg", by: "मीरा कपूर" },
  { id: 160, name: "coastal-cyclone-alert.jpg", by: "कविता रेड्डी" },
];

export const mediaItems: MediaItem[] = seeds.map((seed, index) => ({
  id: `media_${seed.id}`,
  name: seed.name,
  url: `https://picsum.photos/id/${seed.id}/800/600`,
  type: index % 5 === 2 ? "video" : "image",
  sizeLabel: `${(0.4 + (index % 7) * 0.35).toFixed(1)} MB`,
  dimensions: index % 5 === 2 ? "1920×1080" : "1600×1200",
  uploadedByName: seed.by,
  uploadedAt: `2026-09-${String(24 - (index % 9)).padStart(2, "0")}T10:${String(10 + index).padStart(2, "0")}:00.000Z`,
  usedInCount: index % 4,
}));
