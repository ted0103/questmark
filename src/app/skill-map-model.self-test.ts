import assert from "node:assert/strict";
import { buildSkillMap } from "./skill-map-model.ts";

const threeSkill = buildSkillMap([{
  id: "one",
  xp: 90,
  skills: ["Communication", "Courage", "Creativity", "courage", "Unknown"],
  verified: true,
}]);

assert.equal(threeSkill.links.length, 3);
assert.equal(threeSkill.skills.find((skill) => skill.name === "Courage")?.xp, 30);
assert.equal(threeSkill.skills.find((skill) => skill.name === "Courage")?.score, 6);

const weighted = buildSkillMap([
  { id: "one", xp: 80, skills: ["Communication", "Courage"], verified: false },
  { id: "two", xp: 80, skills: ["Communication", "Courage"], verified: true },
]);

assert.equal(weighted.links[0]?.weight, 2);
assert.equal(weighted.skills.find((skill) => skill.name === "Communication")?.xp, 80);
assert.equal(weighted.skills.find((skill) => skill.name === "Communication")?.verifiedCount, 1);

const empty = buildSkillMap([]);
assert.equal(empty.skills.length, 6);
assert.ok(empty.skills.every((skill) => skill.score === 0 && skill.proofIds.length === 0));

console.log("skill-map-model self-test passed");
