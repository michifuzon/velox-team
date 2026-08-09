/**
 * PLACEHOLDER STOCK PHOTOGRAPHY.
 * Hotlinked from Unsplash's public CDN (no API key required) purely so the
 * new magazine-style landing page has real running photography to work with.
 * Every ID below was checked to resolve on images.unsplash.com before use —
 * swap each one for real Veloz Running Team photography (training sessions, races,
 * the actual coaches and alumnos) as soon as it's available.
 */
export function unsplashUrl(id: string, width: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export const STOCK_PHOTOS = {
  heroRunners: "1552674605-db6ffd4facb5", // three runners silhouetted against the sunset
  runnerLegsRoad: "1571008887538-b36bb32f4571", // close-up of a runner's legs on asphalt
  sprintStartBlocks: "1461896836934-ffe607ba8211", // sprinter on starting blocks, athletics track
  gravelRoadFields: "1486218119243-13883505764c", // runner on a gravel road through open fields
  relayTrackBW: "1461897104016-0b3b00cc81ee", // black & white relay race on an athletics track
  aerialTrackSprint: "1519861531473-9200262188bf", // aerial view of sprinters on a red track
  tyingShoesUrban: "1483721310020-03333e577078", // runner tying his shoes on a city street
  groupWarmup: "1517931524326-bdd55a541177", // indoor group stretching / warmup session
  mistyMountains: "1470071459604-3b5ec3a7fe05", // misty green mountain range
  forestTrail: "1441974231531-c6227db76b6e", // sunlit forest trail path
  mountainValley: "1464822759023-fed622ff2c3b", // mountain valley with pine forest
  mountainPeaksClouds: "1506905925346-21bda4d32df4", // dramatic mountain peaks above the clouds
  sunburstMountains: "1500534623283-312aade485b7", // sunset sunburst over mountain ridges
  stretchSunsetOcean: "1544367567-0f2fcb009e0b", // stretching silhouette at sunset by the ocean
} as const;

export type StockPhotoKey = keyof typeof STOCK_PHOTOS;
