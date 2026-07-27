"use client";

import Image from "next/image";
import {
  ArrowRight,
  ArrowCounterClockwise,
  Camera,
  CaretDown,
  CaretRight,
  Cards,
  ChartBar,
  Check,
  Clock,
  Compass,
  IconProps,
  ImageSquare,
  MapPin,
  Medal,
  Moon,
  Eye,
  ChatCircleDots,
  Path,
  ShareNetwork,
  ShieldCheck,
  Sparkle,
  Sun,
  Target,
  User,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { ChangeEvent, FormEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { ServiceWorker } from "./service-worker";
import { buildSkillMap, SkillName } from "./skill-map-model";
import { Coordinates, DEFAULT_ORIGIN, recommendQuests, resolveArea } from "./quest-recommendations";

type Tab = "quests" | "proof" | "growth" | "profile";
type Difficulty = "Easy" | "Medium" | "Bold";
type Quest = {
  id: number;
  difficulty: Difficulty;
  title: string;
  prompt: string;
  place: string;
  travel: string;
  latitude: number;
  longitude: number;
  time: string;
  xp: number;
  skills: string[];
  proof: string;
  safety: string;
};
type Proof = {
  id: string;
  quest: Quest;
  did: string;
  learned: string;
  created: string;
  image?: string;
  verified: boolean;
};

const QUESTS: Quest[] = [
  {
    id: 1,
    difficulty: "Easy",
    title: "Spot What Others Miss",
    prompt: "Find three public design choices that confuse, slow down, or exclude people. Capture them and fix one.",
    place: "KLCC Park",
    travel: "12 min walk",
    latitude: 3.155,
    longitude: 101.7145,
    time: "20 min",
    xp: 50,
    skills: ["Observation", "Creativity"],
    proof: "Three photos and one clear improvement note",
    safety: "Frame the design, not identifiable people",
  },
  {
    id: 2,
    difficulty: "Medium",
    title: "Borrow a Founder’s Nerve",
    prompt: "Ask someone at a local café how their work began. Bring back the decision that changed everything.",
    place: "Feeka Coffee Roasters",
    travel: "18 min transit",
    latitude: 3.1493,
    longitude: 101.7089,
    time: "35 min",
    xp: 80,
    skills: ["Communication", "Courage"],
    proof: "A short field note or consented photo",
    safety: "Ask once, accept no, and never record secretly",
  },
  {
    id: 3,
    difficulty: "Bold",
    title: "Make the Message Click",
    prompt: "Redesign one confusing sign or form so a first-time visitor knows exactly what to do.",
    place: "Kuala Lumpur Library, 1 Jalan Raja",
    travel: "26 min transit",
    latitude: 3.1487,
    longitude: 101.6937,
    time: "50 min",
    xp: 120,
    skills: ["Problem-solving", "Leadership"],
    proof: "A photo of the original and your improved sketch",
    safety: "Observe only; do not alter the real sign",
  },
];

const INITIAL_PROOFS: Proof[] = [
  {
    id: "QM-0248",
    quest: {
      ...QUESTS[2],
      title: "Make the message clearer",
      prompt: "Improve one confusing public sign.",
      xp: 120,
    },
    did: "I reorganised the notice around the one action visitors needed to take first.",
    learned: "People missed the original instruction because every line had the same visual weight.",
    created: "26 Jul 2026",
    image: "/quest-evidence-cafe.webp",
    verified: true,
  },
];

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  mark: Check,
  compass: Compass,
  cards: Cards,
  growth: ChartBar,
  user: User,
  sun: Sun,
  moon: Moon,
  pin: MapPin,
  clock: Clock,
  arrow: ArrowRight,
  close: X,
  camera: Camera,
  share: ShareNetwork,
  spark: Sparkle,
  shield: ShieldCheck,
  chevron: CaretRight,
  reset: ArrowCounterClockwise,
  medal: Medal,
  eye: Eye,
  chat: ChatCircleDots,
  path: Path,
  people: UsersThree,
};

function Icon({ name, size = 20 }: { name: keyof typeof ICONS; size?: number }) {
  const Component = ICONS[name];
  return <Component size={size} weight="regular" aria-hidden="true" />;
}

function levelFor(xp: number) {
  let level = 1;
  let remaining = xp;
  let needed = 500;
  while (remaining >= needed && level < 50) {
    remaining -= needed;
    level += 1;
    needed = 400 + level * 100;
  }
  return { level, remaining, needed };
}

function playMark() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.11, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
  gain.connect(context.destination);
  [440, 659, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(context.currentTime + index * 0.07);
    oscillator.stop(context.currentTime + 0.46);
  });
}

function playAchievement() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const master = context.createGain();
  const now = context.currentTime;
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.14, now + 0.015);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  master.connect(context.destination);
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const bell = context.createGain();
    oscillator.type = index === 3 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, now);
    bell.gain.setValueAtTime(0.0001, now + index * 0.085);
    bell.gain.exponentialRampToValueAtTime(index === 3 ? 0.75 : 0.45, now + index * 0.085 + 0.015);
    bell.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.085 + 0.48);
    oscillator.connect(bell);
    bell.connect(master);
    oscillator.start(now + index * 0.085);
    oscillator.stop(now + index * 0.085 + 0.5);
  });
}

function achievementStates(proofs: Proof[]) {
  return [
    { id: "first-mark", name: "The First Mark", detail: "First real-world quest", earned: proofs.length >= 1, icon: "medal" },
    { id: "proof-in-hand", name: "Proof in Hand", detail: "First Proof Card", earned: proofs.length >= 1, icon: "cards" },
    { id: "second-look", name: "The Second Look", detail: "Observation demonstrated", earned: proofs.some((proof) => proof.quest.skills.includes("Observation")), icon: "eye" },
    { id: "signal-clear", name: "Signal Clear", detail: "Communication demonstrated", earned: proofs.some((proof) => proof.quest.skills.includes("Communication")), icon: "chat" },
    { id: "wayfinder", name: "Wayfinder", detail: "Problem-solving demonstrated", earned: proofs.some((proof) => proof.quest.skills.includes("Problem-solving")), icon: "path" },
    { id: "witnessed", name: "Witnessed", detail: "First peer verification", earned: proofs.some((proof) => proof.verified), icon: "people" },
  ] as const;
}

export function QuestMarkApp() {
  const [tab, setTab] = useState<Tab>("quests");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selected, setSelected] = useState<{ quest: Quest; originX: number; originY: number } | null>(null);
  const [proofs, setProofs] = useState<Proof[]>(INITIAL_PROOFS);
  const [xp, setXp] = useState(620);
  const [celebration, setCelebration] = useState<Proof | null>(null);
  const [portfolio, setPortfolio] = useState<string[]>(["QM-0248"]);
  const [toast, setToast] = useState("");
  const [location, setLocation] = useState("Bukit Bintang, Kuala Lumpur");
  const [origin, setOrigin] = useState<Coordinates>(DEFAULT_ORIGIN);
  const [locationStatus, setLocationStatus] = useState("Ranked from Bukit Bintang demo coordinates.");
  const [reviewSent, setReviewSent] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [showDemoGuide, setShowDemoGuide] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = localStorage.getItem("questmark-state");
      if (saved) {
        const state = JSON.parse(saved);
        setProofs(state.proofs || INITIAL_PROOFS);
        setXp(state.xp || 620);
        setPortfolio(state.portfolio || ["QM-0248"]);
        setTheme(state.theme || "light");
      }
      setShowDemoGuide(localStorage.getItem("questmark-guide-dismissed") !== "true");
      hydrated.current = true;
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (hydrated.current) {
      localStorage.setItem("questmark-state", JSON.stringify({ proofs, xp, portfolio, theme }));
    }
  }, [proofs, xp, portfolio, theme]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const level = levelFor(xp);
  const completedIds = new Set(proofs.map((proof) => proof.quest.id));

  function changeLocation(value: string) {
    setLocation(value);
    const resolved = resolveArea(value);
    if (resolved) {
      setOrigin(resolved);
      setLocationStatus(`Ranked from ${value}. Travel times are local estimates.`);
    } else {
      setLocationStatus("Enter Bukit Bintang, KLCC, Pasar Seni, Chinatown, Jalan Raja or Dataran Merdeka.");
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Location is unavailable in this browser. Enter a KL area instead.");
      return;
    }
    setLocationStatus("Finding your position…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ latitude: coords.latitude, longitude: coords.longitude });
        setLocation("Current location");
        setLocationStatus("Ranked on this device. Your coordinates are not uploaded.");
      },
      () => setLocationStatus("Location was not shared. Enter a KL area instead."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }

  function dismissGuide() {
    setShowDemoGuide(false);
    localStorage.setItem("questmark-guide-dismissed", "true");
  }

  function resetDemo() {
    localStorage.removeItem("questmark-state");
    localStorage.removeItem("questmark-guide-dismissed");
    setProofs(INITIAL_PROOFS);
    setXp(620);
    setPortfolio(["QM-0248"]);
    setTheme("light");
    setLocation("Bukit Bintang, Kuala Lumpur");
    setOrigin(DEFAULT_ORIGIN);
    setLocationStatus("Ranked from Bukit Bintang demo coordinates.");
    setReviewSent(false);
    setNewAchievements([]);
    setShowDemoGuide(true);
    setTab("quests");
    setToast("Demo restored");
  }

  function startQuest(quest: Quest, trigger: HTMLButtonElement) {
    const bounds = trigger.getBoundingClientRect();
    setSelected({
      quest,
      originX: ((bounds.left + bounds.width / 2) / window.innerWidth) * 100,
      originY: ((bounds.top + bounds.height / 2) / window.innerHeight) * 100,
    });
    navigator.vibrate?.(18);
  }

  function complete(proof: Proof) {
    const nextProofs = [proof, ...proofs];
    const before = achievementStates(proofs);
    const unlocked = achievementStates(nextProofs).filter((achievement) =>
      achievement.earned && !before.find((item) => item.id === achievement.id)?.earned,
    );
    setProofs(nextProofs);
    setNewAchievements(unlocked.map((achievement) => achievement.id));
    setXp((current) => current + proof.quest.xp);
    setSelected(null);
    setCelebration(proof);
    if (unlocked.length) {
      playAchievement();
      setToast(`Achievement unlocked: ${unlocked.map((achievement) => achievement.name).join(" + ")}`);
      navigator.vibrate?.([35, 35, 95]);
    } else {
      playMark();
      navigator.vibrate?.([35, 40, 55]);
    }
  }

  async function shareProof(proof: Proof) {
    const text = `${proof.quest.title}: ${proof.quest.skills.join(" + ")}, ${proof.quest.xp} XP`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My QuestMark Proof Card", text });
      } else {
        await navigator.clipboard.writeText(text);
        setToast("Proof Card copied");
      }
    } catch {
      // Closing the native share sheet is an intentional no-op.
    }
  }

  return (
    <div className="app-shell">
      <ServiceWorker />
      <header className="topbar">
        <button className="brand" onClick={() => setTab("quests")} aria-label="QuestMark home">
          <span className="brand-mark"><Icon name="mark" size={18} /></span>
          <span>QuestMark</span>
        </button>
        <div className="topbar-actions">
          <span className="prototype-label"><span /> Local prototype</span>
          <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`}>
            <Icon name={theme === "light" ? "moon" : "sun"} />
          </button>
          <button className="avatar" onClick={() => setTab("profile")} aria-label="Open profile">TM</button>
        </div>
      </header>

      <main>
        {tab === "quests" && (
          <QuestsView
            location={location}
            setLocation={changeLocation}
            origin={origin}
            locationStatus={locationStatus}
            onUseCurrent={useCurrentLocation}
            showDemoGuide={showDemoGuide}
            onDismissGuide={dismissGuide}
            quests={QUESTS}
            completedIds={completedIds}
            level={level}
            xp={xp}
            onSelect={startQuest}
          />
        )}
        {tab === "proof" && (
          <ProofView proofs={proofs} portfolio={portfolio} setPortfolio={setPortfolio} onShare={shareProof} setToast={setToast} />
        )}
        {tab === "growth" && <GrowthView proofs={proofs} level={level} xp={xp} newAchievements={newAchievements} />}
        {tab === "profile" && (
          <ProfileView theme={theme} setTheme={setTheme} reviewSent={reviewSent} setReviewSent={setReviewSent} onReset={resetDemo} />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {([
          ["quests", "compass", "Quests"],
          ["proof", "cards", "Proof"],
          ["growth", "growth", "Growth"],
          ["profile", "user", "You"],
        ] as const).map(([id, icon, label]) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {selected && <CompletionSheet quest={selected.quest} originX={selected.originX} originY={selected.originY} onClose={() => setSelected(null)} onComplete={complete} />}
      {celebration && <Celebration proof={celebration} onClose={() => setCelebration(null)} onShare={() => shareProof(celebration)} />}
      {toast && <div className="toast" role="status"><Icon name="mark" size={17} />{toast}</div>}
    </div>
  );
}

function QuestsView({
  location,
  setLocation,
  origin,
  locationStatus,
  onUseCurrent,
  showDemoGuide,
  onDismissGuide,
  quests,
  completedIds,
  level,
  xp,
  onSelect,
}: {
  location: string;
  setLocation: (value: string) => void;
  origin: Coordinates;
  locationStatus: string;
  onUseCurrent: () => void;
  showDemoGuide: boolean;
  onDismissGuide: () => void;
  quests: Quest[];
  completedIds: Set<number>;
  level: ReturnType<typeof levelFor>;
  xp: number;
  onSelect: (quest: Quest, trigger: HTMLButtonElement) => void;
}) {
  const recommendations = recommendQuests(quests, origin);
  return (
    <div className="page-wrap quest-page">
      <section className="quest-heading">
        <div>
          <p className="eyebrow">Today, 27 July</p>
          <h1>Pick a quest.<br />Leave with a story.</h1>
          <p>Do one small thing in the real world. Bring back proof, reflection, and XP.</p>
        </div>
        <div className="level-orbit" aria-label={`Level ${level.level}, ${level.remaining} of ${level.needed} XP`}>
          <div style={{ "--progress": `${(level.remaining / level.needed) * 360}deg` } as React.CSSProperties}>
            <strong>{level.level}</strong><span>LEVEL</span>
          </div>
          <p><b>{xp.toLocaleString()}</b> lifetime XP</p>
        </div>
      </section>

      {showDemoGuide && (
        <aside className="demo-guide" aria-label="Demo walkthrough">
          <div><span>01</span><p><strong>Choose a quest</strong><small>Recommendations react to your KL starting area.</small></p></div>
          <div><span>02</span><p><strong>Bring back proof</strong><small>Add evidence and one honest reflection.</small></p></div>
          <div><span>03</span><p><strong>Watch skills connect</strong><small>Open Growth to inspect the evidence map.</small></p></div>
          <button onClick={onDismissGuide} aria-label="Dismiss demo walkthrough"><Icon name="close" size={17} /></button>
        </aside>
      )}

      <label className="location-field">
        <Icon name="pin" size={18} />
        <span>
          <small>YOUR STARTING AREA</small>
          <input value={location} onChange={(event) => setLocation(event.target.value)} />
        </span>
        <button onClick={onUseCurrent}>Use current</button>
      </label>
      <p className="location-status" role="status"><Icon name="shield" size={15} />{locationStatus}</p>

      <section className="quest-grid" aria-label="Today’s quests">
        {recommendations.map(({ quest, distanceKm, travel }) => {
          const complete = completedIds.has(quest.id);
          const featured = quest.id === 2;
          return (
            <article className={`quest-card difficulty-${quest.difficulty.toLowerCase()} ${featured ? "featured-quest" : "side-quest"}`} key={quest.id}>
              {featured && (
                <div className="quest-photo" aria-hidden="true">
                  <Image src="/quest-evidence-cafe.webp" alt="" fill priority sizes="(max-width: 900px) 100vw, 66vw" />
                </div>
              )}
              <div className="quest-card-content">
                <div className="quest-card-top">
                  <span className="difficulty">{featured ? "Featured mission" : quest.difficulty}</span>
                  <span className="xp">+{quest.xp} XP</span>
                </div>
                <div className="quest-card-copy">
                  <p className="mission-kicker"><Target size={16} weight="duotone" /> Your mission</p>
                  <h2>{quest.title}</h2>
                  <p>{quest.prompt}</p>
                </div>
                <div className="quest-meta">
                  <span><Icon name="pin" size={15} />{quest.place}</span>
                  <span><Icon name="clock" size={15} />{travel}, {distanceKm.toFixed(1)} km, {quest.time}</span>
                </div>
                <details className="mission-drop">
                  <summary>
                    <span>Open mission brief</span>
                    <CaretDown size={17} weight="bold" />
                  </summary>
                  <div className="mission-brief">
                    <div><Target size={18} weight="duotone" /><span><b>Goal</b>{quest.prompt}</span></div>
                    <div><ImageSquare size={18} weight="duotone" /><span><b>Bring back</b>{quest.proof}</span></div>
                    <div><ShieldCheck size={18} weight="duotone" /><span><b>Keep it safe</b>{quest.safety}</span></div>
                  </div>
                </details>
                <div className="skill-row">{quest.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                <button className={`quest-action ${complete ? "complete" : ""}`} onClick={(event) => !complete && onSelect(quest, event.currentTarget)} disabled={complete}>
                  {complete ? <><Icon name="mark" size={17} /> Quest complete</> : <>Start this quest <Icon name="arrow" size={17} /></>}
                </button>
              </div>
            </article>
          );
        })}
      </section>
      <p className="safety-note"><Icon name="shield" size={16} /> Public places only. Travel times are estimates, so confirm your route before accepting.</p>
    </div>
  );
}

function CompletionSheet({ quest, originX, originY, onClose, onComplete }: { quest: Quest; originX: number; originY: number; onClose: () => void; onComplete: (proof: Proof) => void }) {
  const [did, setDid] = useState("");
  const [learned, setLearned] = useState("");
  const [image, setImage] = useState<string>();
  const [evidenceError, setEvidenceError] = useState("");

  function pickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000 || !["image/jpeg", "image/webp", "image/png"].includes(file.type)) {
      setEvidenceError("Choose a JPEG, PNG, or WebP image smaller than 5 MB.");
      return;
    }
    setEvidenceError("");
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    onComplete({
      id: `QM-${Math.floor(1000 + Math.random() * 8999)}`,
      quest,
      did,
      learned,
      created: new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric" }).format(new Date()),
      image,
      verified: false,
    });
  }

  return (
    <div
      className="sheet-backdrop mission-launch"
      role="presentation"
      style={{ "--launch-x": `${originX}%`, "--launch-y": `${originY}%` } as React.CSSProperties}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <span className="quest-launch-ripple" aria-hidden="true" />
      <section className="completion-sheet" role="dialog" aria-modal="true" aria-labelledby="complete-title" style={{ "--origin-x": `${originX}%`, "--origin-y": `${originY}%` } as React.CSSProperties}>
        <button className="sheet-close" onClick={onClose} aria-label="Close" autoFocus><Icon name="close" /></button>
        <p className="eyebrow">{quest.difficulty} quest, +{quest.xp} XP</p>
        <h2 id="complete-title">Bring back the proof.</h2>
        <p className="sheet-intro"><strong>{quest.title}:</strong> {quest.prompt}</p>
        <form onSubmit={submit}>
          <label className={`evidence-drop ${image ? "has-image" : ""}`}>
            {image ? <Image src={image} alt="Selected evidence preview" fill unoptimized /> : <><Icon name="camera" size={28} /><strong>Add one evidence photo</strong><span>JPEG, PNG or WebP, 5 MB max</span></>}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage} />
          </label>
          {evidenceError && <p className="field-error" role="alert">{evidenceError}</p>}
          <label className="text-field">
            <span>What did you do?</span>
            <textarea value={did} onChange={(event) => setDid(event.target.value)} placeholder="Describe one concrete action…" required minLength={12} />
          </label>
          <label className="text-field">
            <span>What changed in your thinking?</span>
            <textarea value={learned} onChange={(event) => setLearned(event.target.value)} placeholder="Name what surprised or challenged you…" required minLength={12} />
          </label>
          <div className="privacy-line"><Icon name="shield" size={18} /><span>Your evidence stays private. Blur anyone else before adding a photo.</span></div>
          <button className="primary-button" type="submit">Complete quest <Icon name="arrow" size={18} /></button>
        </form>
      </section>
    </div>
  );
}

function Celebration({ proof, onClose, onShare }: { proof: Proof; onClose: () => void; onShare: () => void }) {
  return (
    <div className="celebration-backdrop">
      <section className="celebration" role="dialog" aria-modal="true" aria-labelledby="proof-title">
        <button className="sheet-close inverse" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <div className="proof-photo">
          <Image src={proof.image || "/quest-evidence-cafe.webp"} alt="Quest evidence" fill unoptimized={Boolean(proof.image)} />
          <div className="photo-shade" />
          <span className="verified-stamp"><Icon name="mark" size={15} /> PROTOTYPE ASSESSMENT</span>
        </div>
        <div className="proof-paper">
          <p className="eyebrow">Proof card, {proof.id}</p>
          <h2 id="proof-title">{proof.quest.title}</h2>
          <p>{proof.did}</p>
          <blockquote>“{proof.learned}”</blockquote>
          <div className="proof-skills">{proof.quest.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
          <div className="xp-seal"><strong>+{proof.quest.xp}</strong><span>XP</span></div>
          <div className="proof-actions">
            <button className="primary-button" onClick={onShare}><Icon name="share" size={18} /> Share card</button>
            <button className="text-button" onClick={onClose}>Back to quests</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProofView({ proofs, portfolio, setPortfolio, onShare, setToast }: { proofs: Proof[]; portfolio: string[]; setPortfolio: React.Dispatch<React.SetStateAction<string[]>>; onShare: (proof: Proof) => void; setToast: (message: string) => void }) {
  function toggle(id: string) {
    setPortfolio((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="page-wrap">
      <section className="section-heading">
        <div><p className="eyebrow">Evidence archive</p><h1>Your proof, in hand.</h1><p>Private by default. You choose what leaves QuestMark.</p></div>
        <button className="outline-button" onClick={() => setToast(`${portfolio.length} cards ready for portfolio`)}>{portfolio.length} in portfolio <Icon name="arrow" size={17} /></button>
      </section>
      <div className="proof-grid">
        {proofs.map((proof) => (
          <article className="proof-card" key={proof.id}>
            <div className="proof-card-image">
              <Image src={proof.image || "/quest-evidence-cafe.webp"} alt="" fill unoptimized={Boolean(proof.image)} />
              <span>{proof.verified ? "Peer verified" : "Private proof"}</span>
            </div>
            <div className="proof-card-body">
              <div className="proof-id">{proof.id}, {proof.created}</div>
              <h2>{proof.quest.title}</h2>
              <p>{proof.learned}</p>
              <div className="skill-row">{proof.quest.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
              <div className="proof-card-actions">
                <label className="portfolio-toggle"><input type="checkbox" checked={portfolio.includes(proof.id)} onChange={() => toggle(proof.id)} /><span><Icon name="mark" size={14} /></span> Portfolio</label>
                <button onClick={() => onShare(proof)} aria-label={`Share ${proof.quest.title}`}><Icon name="share" size={18} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function GrowthView({ proofs, level, xp, newAchievements }: { proofs: Proof[]; level: ReturnType<typeof levelFor>; xp: number; newAchievements: string[] }) {
  const [selectedSkill, setSelectedSkill] = useState<SkillName | null>(null);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState(false);
  const [compactMap, setCompactMap] = useState(false);
  const mapRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const model = useMemo(() => buildSkillMap(proofs.map((proof) => ({
    id: proof.id,
    xp: proof.quest.xp,
    skills: proof.quest.skills,
    verified: proof.verified,
    eligible: Boolean(proof.did.trim() && proof.learned.trim()),
  }))), [proofs]);
  const achievements = achievementStates(proofs);
  const positions: Record<SkillName, [number, number]> = {
    Communication: [50, 14],
    Observation: [82, 31],
    Creativity: [82, 69],
    Leadership: [50, 86],
    "Problem-solving": [18, 69],
    Courage: [18, 31],
  };
  const selectedRelation = model.links.find((link) => link.id === selectedLink);
  const selected = model.skills.find((skill) => skill.name === selectedSkill);
  const detailOpen = Boolean(selected || selectedRelation || selectedCenter);
  const strongest = [...model.skills].sort((a, b) => b.score - a.score)[0];
  const emerging = [...model.skills].filter((skill) => skill.score > 0).sort((a, b) => a.score - b.score)[0];

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const observer = new ResizeObserver(([entry]) => setCompactMap(entry.contentRect.width < 520));
    observer.observe(map);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!detailOpen) return;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setSelectedCenter(false);
      setSelectedSkill(null);
      setSelectedLink(null);
      window.requestAnimationFrame(() => lastTrigger.current?.focus());
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function openSkill(skill: SkillName, trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    setSelectedCenter(false);
    setSelectedLink(null);
    setSelectedSkill(skill);
  }

  function openRelation(id: string, trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    setSelectedCenter(false);
    setSelectedSkill(null);
    setSelectedLink(id);
  }

  function closeDetail() {
    setSelectedCenter(false);
    setSelectedSkill(null);
    setSelectedLink(null);
    window.requestAnimationFrame(() => lastTrigger.current?.focus());
  }

  const activeSkills = selectedRelation
    ? new Set<SkillName>([selectedRelation.source, selectedRelation.target])
    : selectedSkill
      ? new Set<SkillName>([selectedSkill])
      : null;

  return (
    <div className="page-wrap">
      <section className="section-heading"><div><p className="eyebrow">Skill map</p><h1>Experience leaves a shape.</h1><p>Progress comes from completed evidence, not self-selected claims.</p></div></section>
      <div className="growth-layout">
        <div className="skill-map-column">
          <section className={`skill-map ${compactMap ? "compact" : ""}`} ref={mapRef} aria-label="Evidence-backed skill network">
            <svg className="skill-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {model.links.map((link) => {
                const [x1, y1] = positions[link.source];
                const [x2, y2] = positions[link.target];
                const active = !activeSkills || (activeSkills.has(link.source) && activeSkills.has(link.target));
                return <line key={link.id} x1={x1} y1={y1} x2={x2} y2={y2} className={active ? "active" : "muted"} style={{ "--weight": Math.min(link.weight, 3) } as React.CSSProperties} />;
              })}
            </svg>
            <button
              className="map-center"
              type="button"
              onClick={(event) => {
                lastTrigger.current = event.currentTarget;
                setSelectedLink(null);
                setSelectedSkill(null);
                setSelectedCenter(true);
              }}
              aria-expanded={selectedCenter}
              aria-controls="map-detail-panel"
              aria-label={`You, level ${level.level}, ${level.remaining} of ${level.needed} XP`}
            >
              <span className="center-ring" style={{ "--progress": `${(level.remaining / level.needed) * 360}deg` } as React.CSSProperties}>
                <strong>{level.level}</strong><small>LEVEL</small>
              </span>
              <em>{xp.toLocaleString()} XP</em>
            </button>
            {model.skills.map((skill, index) => (
              <SkillNode
                key={skill.name}
                skill={skill}
                index={index}
                position={positions[skill.name]}
                selected={selectedSkill === skill.name}
                muted={Boolean(activeSkills && !activeSkills.has(skill.name))}
                onSelect={openSkill}
              />
            ))}
          </section>
          <section className="relationship-panel" aria-labelledby="relationship-title">
            <div>
              <p className="eyebrow">Evidence links</p>
              <h2 id="relationship-title">Skills that showed up together.</h2>
            </div>
            {model.links.length ? (
              <div className="relationship-list">
                {model.links.map((link) => (
                  <button key={link.id} type="button" className={selectedLink === link.id ? "selected" : ""} onClick={(event) => openRelation(link.id, event.currentTarget)}>
                    <span><i style={{ "--link-color": `var(--skill-${model.skills.findIndex((skill) => skill.name === link.source) + 1})` } as React.CSSProperties} />{link.source}</span>
                    <b>{link.weight} shared {link.weight === 1 ? "proof" : "proofs"}</b>
                    <span>{link.target}<i style={{ "--link-color": `var(--skill-${model.skills.findIndex((skill) => skill.name === link.target) + 1})` } as React.CSSProperties} /></span>
                  </button>
                ))}
              </div>
            ) : <p className="empty-relationships">Complete a quest with two skills to draw your first evidence link.</p>}
          </section>
        </div>
        <section className="progress-panel">
          {detailOpen ? (
            <>
              <button className="map-detail-backdrop" onClick={closeDetail} aria-label="Close skill details" />
              <div
                className="map-detail"
                id="map-detail-panel"
                role="dialog"
                aria-modal={compactMap}
                aria-labelledby="map-detail-title"
                onKeyDown={(event) => {
                  if (!compactMap || event.key !== "Tab") return;
                  const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button, [href], input, textarea, [tabindex]:not([tabindex='-1'])")].filter((item) => !item.hasAttribute("disabled"));
                  if (!controls.length) return;
                  const first = controls[0];
                  const last = controls[controls.length - 1];
                  if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                  } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                  }
                }}
              >
                <button ref={closeRef} className="sheet-close" onClick={closeDetail} aria-label="Close details"><Icon name="close" /></button>
                {selectedCenter && (
                  <>
                    <p className="eyebrow">Your constellation</p>
                    <h2 id="map-detail-title">Level {level.level}</h2>
                    <div className="detail-score"><strong>{xp}</strong><span>Lifetime XP<br />{level.needed - level.remaining} to next level</span></div>
                    <div className="progress-track"><span style={{ width: `${(level.remaining / level.needed) * 100}%` }} /></div>
                    <div className="map-summary detail-summary">
                      <div><small>STRONGEST</small><strong>{strongest.score ? strongest.name : "Uncharted"}</strong></div>
                      <div><small>EMERGING</small><strong>{emerging?.name || "Complete a quest"}</strong></div>
                      <div><small>PROOF CARDS</small><strong>{proofs.length}</strong></div>
                    </div>
                  </>
                )}
                {selected && (
                  <>
                    <p className="eyebrow">Skill evidence</p>
                    <h2 id="map-detail-title">{selected.name}</h2>
                    <div className="detail-score"><strong>{selected.score}</strong><span>Skill score<br />{selected.xp} allocated XP</span></div>
                    <div className="progress-track"><span style={{ width: `${selected.score}%` }} /></div>
                    <p>{selected.proofIds.length ? `${selected.proofIds.length} Proof ${selected.proofIds.length === 1 ? "Card" : "Cards"} contributed${selected.verifiedCount ? `, ${selected.verifiedCount} peer verified` : ""}.` : "Uncharted. Your first relevant Proof Card will bring this skill to life."}</p>
                    <h3>Contributing proof</h3>
                    <div className="detail-proof-list">
                      {proofs.filter((proof) => selected.proofIds.includes(proof.id)).map((proof) => <div key={proof.id}><span>{proof.id}</span><strong>{proof.quest.title}</strong><small>+{Math.round(proof.quest.xp / new Set(proof.quest.skills).size)} skill XP</small></div>)}
                      {!selected.proofIds.length && <div><strong>No proof yet</strong><small>Choose a quest tagged {selected.name}.</small></div>}
                    </div>
                    {QUESTS.find((quest) => quest.skills.includes(selected.name) && !proofs.some((proof) => proof.quest.id === quest.id)) && (
                      <div className="next-quest"><Icon name="compass" /><span><small>QUEST TO TRY</small><strong>{QUESTS.find((quest) => quest.skills.includes(selected.name) && !proofs.some((proof) => proof.quest.id === quest.id))?.title}</strong></span></div>
                    )}
                  </>
                )}
                {selectedRelation && (
                  <>
                    <p className="eyebrow">Shared evidence</p>
                    <h2 id="map-detail-title">{selectedRelation.source} × {selectedRelation.target}</h2>
                    <p className="detail-intro">{selectedRelation.weight} Proof {selectedRelation.weight === 1 ? "Card demonstrates" : "Cards demonstrate"} both skills. The connection exists because the evidence does.</p>
                    <div className="detail-proof-list">
                      {proofs.filter((proof) => selectedRelation.proofIds.includes(proof.id)).map((proof) => <div key={proof.id}><span>{proof.id}</span><strong>{proof.quest.title}</strong><small>{proof.verified ? "Peer verified" : "Private proof"}</small></div>)}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : <>
            <p className="eyebrow">Level {level.level}</p>
            <h2>{level.remaining} / {level.needed} XP</h2>
            <div className="progress-track"><span style={{ width: `${(level.remaining / level.needed) * 100}%` }} /></div>
            <p>{level.needed - level.remaining} XP until your next level.</p>
            <div className="map-summary">
              <div><small>STRONGEST</small><strong>{strongest.score ? strongest.name : "Uncharted"}</strong></div>
              <div><small>EMERGING</small><strong>{emerging?.name || "Complete a quest"}</strong></div>
            </div>
            <h3>Achievements</h3>
            <div className="achievement-list">
              {achievements.map((achievement) => (
                <button
                  type="button"
                  className={`${achievement.earned ? "earned" : ""} ${newAchievements.includes(achievement.id) ? "newly-earned" : ""}`}
                  key={achievement.id}
                  disabled={!achievement.earned}
                  onClick={() => {
                    playAchievement();
                    navigator.vibrate?.(35);
                  }}
                  aria-label={achievement.earned ? `Replay ${achievement.name} achievement sound` : `${achievement.name}, locked`}
                >
                  <span className="achievement-logo"><Icon name={achievement.icon} size={19} /></span>
                  <p><strong>{achievement.name}</strong><small>{achievement.detail}</small></p>
                  <span className="achievement-status">{newAchievements.includes(achievement.id) ? "NEW" : achievement.earned ? <Icon name="mark" size={16} /> : <Icon name="shield" size={15} />}</span>
                </button>
              ))}
            </div>
          </>}
        </section>
      </div>
    </div>
  );
}

function SkillNode({
  skill,
  index,
  position,
  selected,
  muted,
  onSelect,
}: {
  skill: ReturnType<typeof buildSkillMap>["skills"][number];
  index: number;
  position: [number, number];
  selected: boolean;
  muted: boolean;
  onSelect: (skill: SkillName, trigger: HTMLButtonElement) => void;
}) {
  const state = useRef({ pointerId: -1, x: 0, y: 0, dragging: false, cancelClick: false });

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    state.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, dragging: false, cancelClick: false };
    event.currentTarget.classList.remove("returning");
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (state.current.pointerId !== event.pointerId) return;
    const rawX = event.clientX - state.current.x;
    const rawY = event.clientY - state.current.y;
    const distance = Math.hypot(rawX, rawY);
    if (!state.current.dragging && distance <= 6) return;
    if (!state.current.dragging) {
      state.current.dragging = true;
      state.current.cancelClick = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const resistance = distance > 28 ? 28 + (distance - 28) * 0.18 : distance;
    const ratio = distance ? resistance / distance : 0;
    event.currentTarget.style.setProperty("--drag-x", `${rawX * ratio}px`);
    event.currentTarget.style.setProperty("--drag-y", `${rawY * ratio}px`);
  }

  function release(event: ReactPointerEvent<HTMLButtonElement>) {
    if (state.current.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (state.current.dragging) {
      event.currentTarget.classList.add("returning");
      event.currentTarget.style.setProperty("--drag-x", "0px");
      event.currentTarget.style.setProperty("--drag-y", "0px");
    }
    state.current.pointerId = -1;
  }

  return (
    <div className={`skill-node-wrap skill-node-${index + 1}`} style={{ "--node-x": `${position[0]}%`, "--node-y": `${position[1]}%` } as React.CSSProperties}>
      <button
        type="button"
        className={`skill-node ${selected ? "selected" : ""} ${muted ? "muted" : ""} ${skill.score ? "" : "uncharted"}`}
        style={{ "--accent": `var(--skill-${index + 1})`, "--score": `${skill.score}%` } as React.CSSProperties}
        aria-expanded={selected}
        aria-controls="map-detail-panel"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onClick={(event) => {
          if (state.current.cancelClick) {
            state.current.cancelClick = false;
            return;
          }
          onSelect(skill.name, event.currentTarget);
        }}
      >
        <span className="node-orb"><i /><b>{skill.score || "·"}</b></span>
        <span className="node-copy"><strong>{skill.name}</strong><small>{skill.score ? `${skill.proofIds.length} proof ${skill.proofIds.length === 1 ? "card" : "cards"}` : "Uncharted"}</small></span>
      </button>
    </div>
  );
}

function ProfileView({ theme, setTheme, reviewSent, setReviewSent, onReset }: { theme: "light" | "dark"; setTheme: (theme: "light" | "dark") => void; reviewSent: boolean; setReviewSent: (sent: boolean) => void; onReset: () => void }) {
  const [rating, setRating] = useState(0);
  return (
    <div className="page-wrap profile-page">
      <section className="profile-intro">
        <div className="large-avatar">TM</div>
        <div><p className="eyebrow">18-24 track</p><h1>Ted’s field record</h1><p>Kuala Lumpur: creativity, communication, courage</p></div>
      </section>
      <div className="settings-layout">
        <section className="settings-card">
          <h2>Preferences</h2>
          <button><span><Icon name="pin" /> Starting area</span><b>Bukit Bintang</b><Icon name="chevron" /></button>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}><span><Icon name={theme === "light" ? "moon" : "sun"} /> Appearance</span><b>{theme === "light" ? "Light" : "Dark"}</b><Icon name="chevron" /></button>
          <button><span><Icon name="shield" /> Privacy & evidence</span><b>Private</b><Icon name="chevron" /></button>
          <button><span><Icon name="cards" /> Export my data</span><Icon name="chevron" /></button>
          <button onClick={onReset}><span><Icon name="reset" /> Reset portfolio demo</span><b>Restore</b><Icon name="chevron" /></button>
        </section>
        <section className="review-card">
          <p className="eyebrow">Help shape QuestMark</p>
          <h2>{reviewSent ? "Review received." : "How does it feel outside?"}</h2>
          {reviewSent ? (
            <p>Thank you. Your review stays private unless you separately approve portfolio use.</p>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); setReviewSent(true); }}>
              <div className="rating" aria-label="Rating">{[1, 2, 3, 4, 5].map((star) => <button type="button" className={star <= rating ? "selected" : ""} onClick={() => setRating(star)} key={star} aria-label={`${star} stars`} aria-pressed={star === rating}>✦</button>)}</div>
              <textarea aria-label="Review" placeholder="What felt useful, strange, or memorable?" required />
              <label className="consent"><input type="checkbox" /> You may feature this review anonymously in the QuestMark portfolio.</label>
              <button className="primary-button" disabled={!rating}>Leave private review <Icon name="arrow" size={17} /></button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
