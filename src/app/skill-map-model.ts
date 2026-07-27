export const SKILL_NAMES = [
  "Communication",
  "Observation",
  "Creativity",
  "Leadership",
  "Problem-solving",
  "Courage",
] as const;

export type SkillName = (typeof SKILL_NAMES)[number];

export type SkillProofInput = {
  id: string;
  xp: number;
  skills: readonly string[];
  verified?: boolean;
  eligible?: boolean;
};

export type SkillMapModel = {
  skills: Array<{
    name: SkillName;
    score: number;
    xp: number;
    proofIds: string[];
    verifiedCount: number;
  }>;
  links: Array<{
    id: string;
    source: SkillName;
    target: SkillName;
    weight: number;
    proofIds: string[];
  }>;
};

const canonical = new Map(SKILL_NAMES.map((name) => [name.toLowerCase(), name]));

export function buildSkillMap(proofs: readonly SkillProofInput[]): SkillMapModel {
  const skillState = new Map(
    SKILL_NAMES.map((name) => [name, { xp: 0, proofIds: [] as string[], verifiedCount: 0 }]),
  );
  const linkState = new Map<string, { source: SkillName; target: SkillName; proofIds: string[] }>();

  for (const proof of proofs) {
    if (proof.eligible === false) continue;
    const skills = [...new Set(proof.skills
      .map((skill) => canonical.get(skill.trim().toLowerCase()))
      .filter((skill): skill is SkillName => Boolean(skill)))];
    if (!skills.length) continue;

    const xpPerSkill = Math.max(0, proof.xp) / skills.length;
    for (const skill of skills) {
      const state = skillState.get(skill)!;
      state.xp += xpPerSkill;
      state.proofIds.push(proof.id);
      if (proof.verified) state.verifiedCount += 1;
    }

    for (let left = 0; left < skills.length; left += 1) {
      for (let right = left + 1; right < skills.length; right += 1) {
        const pair = [skills[left], skills[right]].sort() as [SkillName, SkillName];
        const id = pair.join("--");
        const link = linkState.get(id) ?? { source: pair[0], target: pair[1], proofIds: [] };
        if (!link.proofIds.includes(proof.id)) link.proofIds.push(proof.id);
        linkState.set(id, link);
      }
    }
  }

  return {
    skills: SKILL_NAMES.map((name) => {
      const state = skillState.get(name)!;
      return {
        name,
        score: Math.min(100, Math.round(state.xp / 5)),
        xp: Math.round(state.xp),
        proofIds: state.proofIds,
        verifiedCount: state.verifiedCount,
      };
    }),
    links: [...linkState.entries()]
      .map(([id, link]) => ({ id, ...link, weight: link.proofIds.length }))
      .sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id)),
  };
}
