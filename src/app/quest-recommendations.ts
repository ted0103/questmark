export type Coordinates = { latitude: number; longitude: number };

export const DEFAULT_ORIGIN: Coordinates = { latitude: 3.1466, longitude: 101.7115 };

const AREA_CENTERS: Array<{ terms: string[]; coordinates: Coordinates }> = [
  { terms: ["bukit bintang", "jalan alor", "pavilion"], coordinates: DEFAULT_ORIGIN },
  { terms: ["klcc", "kuala lumpur city centre", "ampang park"], coordinates: { latitude: 3.1579, longitude: 101.7123 } },
  { terms: ["pasar seni", "chinatown", "petaling street"], coordinates: { latitude: 3.1457, longitude: 101.6966 } },
  { terms: ["dataran merdeka", "jalan raja", "masjid jamek"], coordinates: { latitude: 3.149, longitude: 101.6943 } },
];

export function resolveArea(value: string): Coordinates | null {
  const normalized = value.trim().toLowerCase();
  return AREA_CENTERS.find((area) => area.terms.some((term) => normalized.includes(term)))?.coordinates ?? null;
}

function distanceKm(from: Coordinates, to: Coordinates) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function recommendQuests<T extends Coordinates>(quests: readonly T[], origin: Coordinates) {
  return quests
    .map((quest) => {
      const distance = distanceKm(origin, quest);
      const walking = distance <= 1.8;
      return {
        quest,
        distanceKm: distance,
        travel: walking ? `${Math.max(4, Math.round(distance * 13))} min walk` : `${Math.max(12, Math.round(distance * 7 + 8))} min transit`,
      };
    })
    .sort((left, right) => left.distanceKm - right.distanceKm);
}
