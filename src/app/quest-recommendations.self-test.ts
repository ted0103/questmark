import assert from "node:assert/strict";
import { DEFAULT_ORIGIN, recommendQuests, resolveArea } from "./quest-recommendations.ts";

assert.deepEqual(resolveArea("Near KLCC"), { latitude: 3.1579, longitude: 101.7123 });
assert.equal(resolveArea("Unknown place"), null);

const ranked = recommendQuests([
  { id: "far", latitude: 3.2, longitude: 101.8 },
  { id: "near", latitude: DEFAULT_ORIGIN.latitude, longitude: DEFAULT_ORIGIN.longitude },
], DEFAULT_ORIGIN);

assert.equal(ranked[0].quest.id, "near");
assert.equal(ranked[0].travel, "4 min walk");
assert.ok(ranked[1].distanceKm > ranked[0].distanceKm);

console.log("quest-recommendations self-test passed");
