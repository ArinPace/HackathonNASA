import { useState } from "react";
import {
  Satellite,
  ArrowRight,
  Lock,
  Check,
  Star,
  RotateCcw,
  Map,
  Info,
} from "lucide-react";
import {
  missions,
  assignments,
  parseProgress,
  unlocked,
  xp,
  rank,
  award,
  stars,
  loads,
  orbitGoal,
  orbitKit,
  type Result,
  type Progress,
} from "./model";
import {
  SignalChallenge,
  OrbitChallenge,
  ManeuverChallenge,
} from "./Challenges";
import { LaunchScreen } from "../LaunchScreen";
import { MissionIntro } from "../MissionIntro";
import { balancedDesign } from "../sim/mission";
import { Workshop } from "./MissionWorkshop";
import { starterBuild, deriveBuild, type Build } from "./workshop";
import {
  DeploymentChallenge,
  NavigationChallenge,
  SurfaceChallenge,
} from "./FlightOperations";
import { missionStages, missionRating, type FlightPhase } from "./operations";
import "./career.css";
const KEY = "ols-career-v1";
function read() {
  try {
    return parseProgress(localStorage.getItem(KEY));
  } catch {
    return parseProgress(null);
  }
}
function goals(index: number) {
  const a = assignments[index],
    t = a.tier;
  if (a.kind === "signal")
    return [
      "Deploy solar wings",
      ...(t > 0
        ? [
            `Keep the antenna within 3° of ${t === 2 ? "a moving target" : "Earth"}`,
          ]
        : []),
      `Send ${2 + t * 2} MiB of test data home`,
      ...(t === 2 ? ["Keep the low battery alive through shadow"] : []),
    ];
  if (a.kind === "dock")
    return [
      `Align within ${(2 - t * 0.4).toFixed(1)} m of the station port`,
      `Dock below ${(0.8 - t * 0.15).toFixed(2)} m/s`,
      `Stay within ${8 - t * 2}° of the port orientation`,
    ];
  if (a.kind === "land")
    return [
      `Land within ${35 - t * 10} m of the pad`,
      `Touch down below ${(3 - t * 0.5).toFixed(1)} m/s downward`,
      "Cancel sideways drift; preserve landing fuel",
    ];
  return [
    `Return images from ${orbitGoal(a.world, t)} different areas`,
    `Finish with at least ${10 + t * 5}% battery`,
    ...(a.world === "earth"
      ? [`Survive ${180 * (t + 1)} simulated seconds of darkness`]
      : ["Return at least 85% of collected data"]),
    ...(a.kind === "mars"
      ? [`Then land inside a ${35 - t * 10} m landing margin`]
      : []),
  ];
}
export function Campaign({ onSandbox }: { onSandbox: () => void }) {
  const [progress, setProgress] = useState<Progress>(read),
    [phase, setPhase] = useState<
      "map" | "brief" | "workshop" | "launch" | "result" | FlightPhase
    >("map"),
    [selected, setSelected] = useState(0),
    [load, setLoad] = useState(0),
    [result, setResult] = useState<Result | null>(null),
    [earned, setEarned] = useState(0),
    [intro, setIntro] = useState(false),
    [muted, setMuted] = useState(true),
    [attempt, setAttempt] = useState(0);
  const [build, setBuild] = useState<Build>(() => starterBuild(0));
  const kit = deriveBuild(build, selected);
  const [stageResults, setStageResults] = useState<Record<string, Result>>({});
  const [checkpoint, setCheckpoint] = useState<FlightPhase>("commission");
  const stages = missionStages(selected);
  const a = assignments[selected],
    points = xp(progress),
    done = Object.keys(progress.best).length,
    next = Math.min(
      assignments.length - 1,
      assignments.findIndex((m) => progress.best[m.id] === undefined) < 0
        ? 17
        : assignments.findIndex((m) => progress.best[m.id] === undefined),
    );
  function persist(p: Progress) {
    setProgress(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* Career stays playable if device storage is unavailable. */
    }
  }
  function choose(i: number) {
    if (!unlocked(progress, i)) return;
    setSelected(i);
    setBuild(starterBuild(i));
    setLoad(i >= 9 ? 2 : 0);
    setPhase("brief");
    setResult(null);
    setStageResults({});
    setCheckpoint("commission");
  }
  function start() {
    setAttempt((n) => n + 1);
    setPhase("workshop");
  }
  function finish(r: Result) {
    let final = r;
    if (stages.some((stage) => stage.id === phase))
      setCheckpoint(phase as FlightPhase);
    if (r.success) {
      const completed = { ...stageResults, [phase]: r };
      setStageResults(completed);
      const nextStage =
        stages[stages.findIndex((stage) => stage.id === phase) + 1];
      if (nextStage) {
        setPhase(nextStage.id);
        return;
      }
      const results = stages.map((stage) => completed[stage.id]);
      if (results.some((value) => !value?.success)) return;
      final = {
        ...r,
        score: missionRating(results),
        reason:
          a.kind === "mars"
            ? "Orbital survey complete. Lander safe. Rover samples received. You operated the complete expedition from payload release to surface science."
            : a.kind === "land"
              ? "Safe payload release, orbit insertion, touchdown and rover science. The complete lunar expedition returned useful evidence."
              : `All ${stages.length} flight stages complete. ${r.reason}`,
        stats: stages.flatMap((stage) =>
          completed[stage.id].stats.map((stat) => ({
            ...stat,
            label: `${stage.label}: ${stat.label}`,
          })),
        ),
      };
    }
    setResult(final);
    if (final.success) {
      const p = award(progress, selected, final.score);
      setEarned(xp(p) - points);
      persist(p);
    } else setEarned(0);
    setPhase("result");
  }
  return (
    <div className="career-app">
      <header>
        <button className="career-brand" onClick={() => setPhase("map")}>
          <span className="brand-mark">
            <Satellite size={24} />
          </span>
          <span>
            ONE LAST SIGNAL<small>FROM FIRST SATELLITE TO MARS</small>
          </span>
        </button>
        <div className="career-header-progress">
          <span>{rank(points)}</span>
          <b>{points.toLocaleString()} XP</b>
        </div>
        <div className="header-actions">
          <button className="text-button" onClick={() => setIntro(true)}>
            <Info size={15} /> Start from basics
          </button>
          <button className="text-button" onClick={onSandbox}>
            Lunar sandbox ↗
          </button>
        </div>
      </header>
      {phase === "map" ? (
        <main className="career-main">
          <section className="career-hero">
            <div>
              <span className="eyebrow">
                YOUR SPACE PROGRAM · 6 CHAPTERS · 18 ASSIGNMENTS
              </span>
              <h1>
                Start small.
                <br />
                <em>Earn the stars.</em>
              </h1>
              <p>
                Launch your first satellite. Learn one skill at a time. Every
                chapter has three assignments with tighter margins and new
                objectives. Master the basics near Earth, then take them to the
                Moon and Mars.
              </p>
              <button className="primary" onClick={() => choose(next)}>
                {done === 0
                  ? "Begin level 1"
                  : done === 18
                    ? "Replay the final expedition"
                    : `Continue level ${next + 1}: ${assignments[next].title}`}
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="career-passport">
              <div className="passport-orbit">
                <span>🌍</span>
                <i>🛰</i>
              </div>
              <span className="eyebrow">YOUR PILOT RECORD</span>
              <h2>{rank(points)}</h2>
              <b>
                {done}
                <small> / 18 assignments complete</small>
              </b>
              <div className="career-meter">
                <i>
                  <em style={{ width: `${(done / 18) * 100}%` }} />
                </i>
              </div>
              <p>
                {points} XP ·{" "}
                {Object.values(progress.best).reduce((n, s) => n + stars(s), 0)}{" "}
                mastery stars
              </p>
            </div>
          </section>
          <div className="career-map-title">
            <h2>Your journey</h2>
            <span>
              Complete each assignment to unlock the next. Replays improve
              mastery; they do not farm XP.
            </span>
          </div>
          <section
            className="career-chapters"
            aria-label="Career mission chapters"
          >
            {missions.map((chapter, c) => (
              <article
                key={chapter.id}
                className={
                  "chapter-card " +
                  (unlocked(progress, c * 3)
                    ? "chapter-open"
                    : "chapter-locked")
                }
              >
                <div className="chapter-top">
                  <span>{chapter.emoji}</span>
                  <small>CHAPTER {c + 1} / 6</small>
                  <b>
                    {
                      Array.from(
                        { length: 3 },
                        (_, t) =>
                          progress.best[assignments[c * 3 + t].id] !==
                          undefined,
                      ).filter(Boolean).length
                    }
                    /3
                  </b>
                </div>
                <h3>{chapter.title}</h3>
                <p>{chapter.lesson}</p>
                <div className="chapter-skill">
                  NEW SKILL · {chapter.newSkill}
                </div>
                <div className="chapter-assignments">
                  {assignments.slice(c * 3, c * 3 + 3).map((m, t) => {
                    const index = c * 3 + t,
                      open = unlocked(progress, index),
                      best = progress.best[m.id];
                    return (
                      <button
                        key={m.id}
                        disabled={!open}
                        onClick={() => choose(index)}
                        title={
                          open ? m.story : `Complete level ${index} to unlock`
                        }
                      >
                        <span className="assignment-num">{index + 1}</span>
                        <div>
                          <b>{m.title}</b>
                          <small>
                            {["TRAINING", "OPERATIONS", "MASTERY"][t]} · {m.xp}{" "}
                            BASE XP
                          </small>
                        </div>
                        {best !== undefined ? (
                          <span
                            className="assignment-stars"
                            aria-label={`${stars(best)} stars`}
                          >
                            {"★".repeat(stars(best))}
                            {"☆".repeat(3 - stars(best))}
                          </span>
                        ) : open ? (
                          <ArrowRight size={15} />
                        ) : (
                          <Lock size={13} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <span className="chapter-reward">
                  {progress.best[assignments[c * 3 + 2].id] !== undefined
                    ? "✓ BADGE EARNED"
                    : "CHAPTER BADGE"}{" "}
                  · {chapter.badge}
                </span>
              </article>
            ))}
          </section>
          <section className="career-ground-rules">
            <p>
              <b>Every flight builds on the last.</b> Later assignments ask you
              to do more with smaller reserves, narrower docking/landing
              tolerances, and harder communication windows. The mission loop
              stays familiar.
            </p>
            <p>
              Progress is stored on this device. Missions use simplified
              training physics and fictional spacecraft specifications.{" "}
              <a
                href="https://ssd.jpl.nasa.gov/astro_par.html"
                target="_blank"
                rel="noreferrer"
              >
                JPL gravity constants
              </a>{" "}
              and{" "}
              <a
                href="https://ssd.jpl.nasa.gov/planets/phys_par.html"
                target="_blank"
                rel="noreferrer"
              >
                planetary physical parameters
              </a>{" "}
              inform the models; game-balance factors are labeled.
            </p>
            <button
              onClick={() => {
                if (
                  confirm(
                    "Reset career progress and earned stars on this device?",
                  )
                )
                  persist(parseProgress(null));
              }}
            >
              Reset career progress
            </button>
          </section>
        </main>
      ) : (
        <>
          <div className="career-mission-strip">
            <button onClick={() => setPhase("map")}>
              <Map size={14} /> Mission map
            </button>
            <span>
              CHAPTER {a.chapter + 1} · ASSIGNMENT {a.tier + 1}/3
            </span>
            <b>
              LEVEL {selected + 1} · {a.title}
            </b>
          </div>
          {phase !== "brief" && phase !== "workshop" && phase !== "result" && (
            <nav
              className="mission-stage-track"
              aria-label="Mission flight stages"
            >
              <span className={phase === "launch" ? "active" : "done"}>
                01 Launch / delivery
              </span>
              {stages.map((stage, i) => (
                <span
                  key={stage.id}
                  className={
                    phase === stage.id
                      ? "active"
                      : stageResults[stage.id]
                        ? "done"
                        : ""
                  }
                >
                  {String(i + 2).padStart(2, "0")}{" "}
                  {stageResults[stage.id] ? "✓ " : ""}
                  {stage.label}
                </span>
              ))}
            </nav>
          )}
          {phase === "brief" ? (
            <section className="assignment-brief">
              <div className={"assignment-world planet-" + a.world}>
                <span>{a.emoji}</span>
                <small>
                  DESTINATION ·{" "}
                  {a.world === "earth"
                    ? "EARTH ORBIT"
                    : a.world === "moon"
                      ? "THE MOON"
                      : "MARS"}
                </small>
                <h1>{a.title}</h1>
                <p>{a.story}</p>
                <div className="difficulty-ladder">
                  {["Training", "Operations", "Mastery"].map((t, i) => (
                    <span className={i <= a.tier ? "active" : ""} key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="assignment-brief-controls">
                <span className="eyebrow">MISSION OBJECTIVES</span>
                <h2>
                  {a.tier === 0
                    ? "Learn the maneuver."
                    : a.tier === 1
                      ? "Tighten your technique."
                      : "Prove your mastery."}
                </h2>
                <div className="goal-checks">
                  <span>○ Safely release and stabilize the payload</span>
                  {a.chapter > 0 && (
                    <span>○ Time and control the orbit insertion burn</span>
                  )}
                  {goals(selected).map((g) => (
                    <span key={g}>○ {g}</span>
                  ))}
                  {(a.kind === "mars" || a.kind === "land") && (
                    <span>
                      ○ Drive the rover, collect {2 + a.tier} unique samples and
                      return their evidence
                    </span>
                  )}
                </div>
                <div className="career-tip">
                  <b>What gets harder?</b>
                  <p>
                    {a.kind === "signal"
                      ? [
                          "Return a test message within 60 seconds. Transmitting without solar power can exhaust the battery and fail the mission.",
                          "Return a longer message within 52 seconds. You must aim the antenna; off-target transmission wastes power.",
                          "Return the longest message within 44 seconds. Precharge a low battery, track a moving antenna target and operate through shadow.",
                        ][a.tier]
                      : a.kind === "dock"
                        ? `Assignment ${a.tier + 1}: less maneuvering fuel, a ${((2 - a.tier * 0.4) * 2).toFixed(1)} m-wide alignment zone, and a ${(0.8 - a.tier * 0.15).toFixed(2)} m/s contact limit.`
                        : a.kind === "land"
                          ? `Assignment ${a.tier + 1}: a smaller pad, less fuel, a higher start and a ${(3 - a.tier * 0.5).toFixed(1)} m/s touchdown limit.`
                          : `Assignment ${a.tier + 1}: ${orbitGoal(a.world, a.tier)} survey areas, ${10 + a.tier * 5}% battery reserve and smaller storage. ${a.kind === "mars" ? "A powered landing follows the orbital survey." : ""}`}
                  </p>
                </div>
                <p className="career-tip">
                  Next: configure spacecraft equipment and rocket stages in the
                  mission workshop. Budget, mass, power and radio trade-offs
                  affect the actual attempt.
                </p>
                <div className="assignment-reward">
                  <Star size={17} />
                  <span>
                    {a.xp} base XP · bonus mastery stars ·{" "}
                    {progress.best[a.id] !== undefined
                      ? `Personal best ${progress.best[a.id]}/100`
                      : "Next assignment unlocks on success"}
                  </span>
                </div>
                <button className="primary" onClick={start}>
                  Build spacecraft & rocket
                  <ArrowRight size={17} />
                </button>
                <p className="career-micro">
                  Launch once to earn a reusable launch certificate. Later
                  assignments can skip the ride so you spend time mastering new
                  skills.
                </p>
              </div>
            </section>
          ) : phase === "workshop" ? (
            <Workshop
              index={selected}
              build={build}
              onChange={setBuild}
              certificate={progress.launchCertified}
              onCommit={(skip) => {
                if (kit.blocks.length) return;
                setStageResults({});
                setCheckpoint("commission");
                setPhase(skip ? "commission" : "launch");
              }}
            />
          ) : phase === "launch" ? (
            <LaunchScreen
              design={{
                ...balancedDesign,
                launcher: build.booster === "heavy" ? "heavy" : "light",
              }}
              destination={a.world}
              payloadKg={kit.mass}
              rocketConfig={kit.rocket}
              assistInitially={false}
              reduced={
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
              }
              muted={muted}
              onMute={() => setMuted(!muted)}
              paused={intro}
              onComplete={() => {
                persist({ ...progress, launchCertified: true });
                setPhase("commission");
              }}
            />
          ) : phase === "result" && result ? (
            <section
              className={"career-result " + (result.success ? "won" : "lost")}
            >
              <div className="result-orbit-symbol">
                {result.success ? "✦" : "↺"}
              </div>
              <span className="eyebrow">
                LEVEL {selected + 1} · {a.title.toUpperCase()}
              </span>
              <h1>
                {result.success ? "Assignment complete." : "One more attempt."}
              </h1>
              <div
                className="result-stars"
                aria-label={
                  result.success
                    ? `${stars(result.score)} mastery stars`
                    : "No stars earned"
                }
              >
                {result.success
                  ? "★".repeat(stars(result.score)) +
                    "☆".repeat(3 - stars(result.score))
                  : "☆☆☆"}
              </div>
              <p>{result.reason}</p>
              <div className="career-result-stats">
                {result.stats.map((item, i) => (
                  <div key={i}>
                    <span>{item.label}</span>
                    <b>{item.value}</b>
                  </div>
                ))}
              </div>
              {result.success && (
                <div className="career-xp-reward">
                  <b>+{earned} XP</b>
                  {selected < 17 && (
                    <span className="level-unlocked">
                      LEVEL {selected + 2} AVAILABLE ·{" "}
                      {assignments[selected + 1].title}
                    </span>
                  )}
                  <span>
                    {earned === 0
                      ? "Personal best retained. Replays award extra XP only when mastery improves."
                      : `${rank(xp(progress))} · Progress saved on this device`}
                  </span>
                  {a.tier === 2 && <strong>🏅 {a.badge} badge earned</strong>}
                </div>
              )}
              <div className="career-result-actions">
                {result.success && selected < 17 && (
                  <button
                    className="primary"
                    onClick={() => choose(selected + 1)}
                  >
                    Unlock level {selected + 2}:{" "}
                    {assignments[selected + 1].title}
                    <ArrowRight size={17} />
                  </button>
                )}
                {result.success && selected === 17 && (
                  <div className="campaign-complete">
                    ALL 18 ASSIGNMENTS COMPLETE · YOUR SPACE PROGRAM REACHED
                    MARS
                  </div>
                )}
                <button
                  className="secondary"
                  onClick={() => {
                    setAttempt((n) => n + 1);
                    setPhase(checkpoint);
                    setResult(null);
                  }}
                >
                  {" "}
                  {result.success
                    ? "Replay for a better rating"
                    : "Retry from this checkpoint"}{" "}
                  <RotateCcw size={14} />
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    setResult(null);
                    setPhase("workshop");
                  }}
                >
                  Redesign spacecraft & rocket
                </button>
                <button className="text-button" onClick={() => setPhase("map")}>
                  Return to mission map
                </button>
              </div>
            </section>
          ) : (
            <div key={`${a.id}-${attempt}-${phase}`}>
              {phase === "commission" ? (
                <DeploymentChallenge
                  tier={a.tier}
                  kit={kit}
                  suspended={intro}
                  onDone={finish}
                />
              ) : phase === "navigation" ? (
                <NavigationChallenge
                  world={a.world}
                  tier={a.tier}
                  kit={kit}
                  suspended={intro}
                  onDone={finish}
                />
              ) : phase === "explore" ? (
                <SurfaceChallenge
                  world={a.world}
                  tier={a.tier}
                  kit={kit}
                  suspended={intro}
                  onDone={finish}
                />
              ) : a.kind === "signal" ? (
                <SignalChallenge
                  suspended={intro}
                  kit={kit}
                  tier={a.tier}
                  onDone={finish}
                />
              ) : a.kind === "dock" ? (
                <ManeuverChallenge
                  suspended={intro}
                  kit={kit}
                  tier={a.tier}
                  kind="dock"
                  world="earth"
                  onDone={finish}
                />
              ) : a.kind === "land" || phase === "surface" ? (
                <ManeuverChallenge
                  suspended={intro}
                  kit={kit}
                  tier={a.tier}
                  kind="land"
                  world={a.world}
                  onDone={finish}
                />
              ) : (
                <OrbitChallenge
                  suspended={intro}
                  kit={kit}
                  tier={a.tier}
                  world={a.world}
                  load={load}
                  onDone={finish}
                />
              )}
            </div>
          )}
        </>
      )}
      {intro && (
        <MissionIntro
          career
          onGuided={() => {
            setIntro(false);
            choose(0);
          }}
          onFree={() => {
            setIntro(false);
            onSandbox();
          }}
        />
      )}
    </div>
  );
}
