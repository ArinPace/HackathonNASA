import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Radio,
  Sun,
  ScanLine,
  Shield,
  Play,
  Pause,
  RotateCcw,
  Satellite,
  ChevronRight,
  Check,
  AlertTriangle,
  Volume2,
  VolumeX,
  Info,
  Download,
} from "lucide-react";
import { Scene } from "./Scene";
import {
  initialDesign,
  balancedDesign,
  catalog,
  vehicle,
  review,
  period,
  env,
  createState,
  advance,
  command,
  science,
  queued,
  simulate,
  type Design,
  type State,
  type Mode,
} from "./sim/mission";
import "./style.css";
const fmt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 1 });
const time = (s: number) =>
  `${Math.floor(s / 3600)
    .toString()
    .padStart(2, "0")}:${Math.floor((s % 3600) / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(s % 60)
    .toString()
    .padStart(2, "0")}`;
function App() {
  const [design, setDesign] = useState<Design>(initialDesign),
    [stage, setStage] = useState<"build" | "review" | "flight" | "report">(
      "build",
    ),
    [tab, setTab] = useState<keyof typeof catalog>("camera"),
    [brief, setBrief] = useState(!localStorage.getItem("ols-intro")),
    [sources, setSources] = useState(false),
    [muted, setMuted] = useState(true),
    [reduced, setReduced] = useState(false),
    [speed, setSpeed] = useState(60),
    [paused, setPaused] = useState(false),
    [auto, setAuto] = useState(false),
    [tick, setTick] = useState(0),
    [previous, setPrevious] = useState<{
      score: number;
      cells: number;
      cost: number;
    } | null>(null),
    [notice, setNotice] = useState("");
  const state = useRef<State>(createState(design));
  const v = vehicle(design),
    r = review(design),
    s = state.current,
    e = env(design, s.t),
    sc = science(s);
  const beep = () => {
    if (muted) return;
    try {
      const c = new AudioContext(),
        o = c.createOscillator(),
        g = c.createGain();
      o.frequency.value = 620;
      g.gain.setValueAtTime(0.05, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.16);
      o.connect(g).connect(c.destination);
      o.start();
      o.stop(c.currentTime + 0.17);
      o.onended = () => c.close();
    } catch {}
  };
  const mode = (m: Mode) => {
    command(state.current, m);
    beep();
    setTick((n) => n + 1);
  };
  useEffect(() => {
    if (stage !== "flight" || paused) return;
    const id = setInterval(() => {
      const st = state.current;
      let remaining = speed * 0.1;
      while (remaining > 1e-8 && !st.ended) {
        if (auto && Math.abs(st.t / 10 - Math.round(st.t / 10)) < 1e-7) {
          const en = env(design, st.t);
          modeQuiet(
            st.energy < v.capacity * 0.2
              ? "charge"
              : en.contact && queued(st) > 1
                ? "downlink"
                : en.target && queued(st) < v.storage - 3
                  ? "observe"
                  : "charge",
          );
        }
        const step = Math.min(remaining, 10 - (st.t % 10));
        advance(st, design, step);
        remaining -= step;
      }
      setTick((n) => n + 1);
      if (st.ended) {
        setPaused(true);
        setStage("report");
      }
    }, 100);
    function modeQuiet(m: Mode) {
      command(state.current, m);
    }
    return () => clearInterval(id);
  }, [stage, paused, speed, auto, design]);
  useEffect(() => {
    const listener = (ev: KeyboardEvent) => {
      if (
        (ev.target as HTMLElement).tagName === "SELECT" ||
        (ev.target as HTMLElement).tagName === "INPUT" ||
        brief ||
        sources
      )
        return;
      if (stage === "flight") {
        const modes: Record<string, Mode> = {
          "1": "observe",
          "2": "downlink",
          "3": "charge",
          "4": "safe",
        };
        if (modes[ev.key]) mode(modes[ev.key]);
        if (ev.code === "Space") {
          ev.preventDefault();
          setPaused((p) => !p);
        }
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  });
  function change(key: keyof Design, id: string) {
    setDesign((d) => ({ ...d, [key]: id }));
    beep();
  }
  function launch() {
    state.current = createState(design);
    setPaused(false);
    setStage("flight");
    beep();
  }
  function save() {
    localStorage.setItem("ols-save", JSON.stringify({ version: 1, design }));
    setNotice("Design saved on this device.");
  }
  function load() {
    try {
      const x = JSON.parse(localStorage.getItem("ols-save") || "null");
      if (x?.version !== 1) throw Error();
      for (const k of Object.keys(initialDesign) as (keyof Design)[]) {
        const allowed = {
          camera: ["context", "detail"],
          radio: ["basic", "strong"],
          solar: ["small", "large"],
          battery: ["small", "large"],
          storage: ["small", "large"],
          orbit: ["polar", "high", "equatorial"],
          launcher: ["light", "heavy"],
        }[k];
        if (!allowed.includes(x.design[k])) throw Error();
      }
      setDesign(x.design);
      setNotice("Saved design restored.");
    } catch {
      setNotice("No valid saved design found.");
    }
  }
  function redesign() {
    setPrevious({ score: sc.score, cells: sc.cells, cost: v.cost });
    setStage("build");
    state.current = createState(design);
  }
  function benchmark() {
    const a = simulate(design),
      b = simulate(balancedDesign);
    setNotice(
      `Same automated policy: your design ${science(a).cells} cells / ${fmt(a.sent)} MiB returned; balanced reference ${science(b).cells} cells / ${fmt(b.sent)} MiB. Computed now, not scripted.`,
    );
  }
  const download = () => {
    const blob = new Blob(
        [
          JSON.stringify(
            {
              model: "1",
              design,
              result: sc,
              events: s.events,
              commands: s.commands,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
      u = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = u;
    a.download = "one-last-signal-mission.json";
    a.click();
    URL.revokeObjectURL(u);
  };
  return (
    <div className="app" data-tick={tick}>
      <header>
        <a className="brand" href="#" onClick={(ev) => ev.preventDefault()}>
          <span className="brand-mark">
            <Satellite size={24} />
          </span>
          <span>
            ONE LAST SIGNAL<small>MISSION DESIGN SIMULATOR</small>
          </span>
        </a>
        <nav>
          <span className="live-dot" /> DEEP SPACE NETWORK{" "}
          <span className="nav-divider">/</span> LUNAR DIVISION
        </nav>
        <div className="header-actions">
          <button
            className="icon"
            aria-label={muted ? "Unmute sound" : "Mute sound"}
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <button className="text-button" onClick={() => setSources(true)}>
            <Info size={15} /> Mission notes
          </button>
        </div>
      </header>
      <div className="subnav">
        <div className="mission-code">
          FLIGHT PROGRAM <b>LP–006</b>
        </div>
        <div className="steps">
          {["ASSEMBLE", "REVIEW", "OPERATE", "DEBRIEF"].map((x, i) => (
            <span
              className={
                ["build", "review", "flight", "report"].indexOf(stage) === i
                  ? "active"
                  : ""
              }
              key={x}
            >
              <i>{i + 1}</i>
              {x}
              {i < 3 && <ChevronRight size={13} />}
            </span>
          ))}
        </div>
        <span className="version">SIMULATION / 01</span>
      </div>
      <main>
        <section className="workspace">
          <div className="scene-heading">
            <div className="eyebrow">
              <span className="tiny-square" />{" "}
              {stage === "build"
                ? "VEHICLE ASSEMBLY BAY"
                : stage === "review"
                  ? "PRE-FLIGHT READINESS"
                  : stage === "report"
                    ? "MISSION ARCHIVE"
                    : "LUNAR OPERATIONS"}
            </div>
            <h1>
              {stage === "build" ? (
                <>
                  Big ambitions.
                  <br />
                  <em>Finite resources.</em>
                </>
              ) : stage === "review" ? (
                <>
                  Ready for
                  <br />
                  <em>the unknown?</em>
                </>
              ) : stage === "report" ? (
                <>
                  The science
                  <br />
                  <em>made it home?</em>
                </>
              ) : (
                <>
                  A long way
                  <br />
                  <em>from home.</em>
                </>
              )}
            </h1>
            <p>
              {stage === "build"
                ? "Build a spacecraft that can do more than reach the Moon. Build one that can bring the science back."
                : stage === "review"
                  ? "A working spacecraft is a system of compromises. Know yours before you commit."
                  : stage === "report"
                    ? "Every byte has a journey. See what your choices made possible."
                    : "Six orbits. One spacecraft. Make every observation—and every contact—count."}
            </p>
          </div>
          <Scene
            design={design}
            state={s}
            flight={stage === "flight" || stage === "report"}
            reduced={reduced}
          />
          <div className="scene-label">
            <span className="crosshair">＋</span>
            <div>
              LUNAR POLAR SCOUT
              <small>
                {stage === "build"
                  ? "CONFIGURATION / " +
                    (design.camera === "detail" ? "HIGH DETAIL" : "WIDE SURVEY")
                  : `MISSION ELAPSED / ${time(s.t)}`}
              </small>
            </div>
            <span className="scene-tag">
              {stage === "flight"
                ? e.eclipse
                  ? "IN ECLIPSE"
                  : "SUNLIT"
                : "UNCREWED / CLASS I"}
            </span>
          </div>
          <div className="scene-footer">
            <span>
              ← DRAG TO ROTATE{" "}
              {stage === "flight" ? " · POINTING FOLLOWS COMMANDS" : ""}
            </span>
            <span>
              EARTH → MOON <ArrowUpRight size={13} />
            </span>
          </div>
          <div className="objective">
            <div className="objective-icon">
              <ScanLine size={21} />
            </div>
            <div>
              <span className="eyebrow">THE MISSION</span>
              <h3>Find the next place to look.</h3>
              <p>
                Survey the lunar south pole. Return paired hydrogen-proxy and
                context observations from at least <b>3 unique cells</b>.
              </p>
            </div>
            <span className="objective-id">01 / SCIENCE</span>
          </div>
        </section>
        <aside>
          {stage === "build" ? (
            <>
              <div className="panel-title">
                <div>
                  <span className="eyebrow">YOUR SPACECRAFT</span>
                  <h2>Engineer the outcome.</h2>
                </div>
                <span className="pill">8 SUBSYSTEMS</span>
              </div>
              <div className="tabs">
                {(Object.keys(catalog) as (keyof typeof catalog)[]).map((k) => (
                  <button
                    key={k}
                    className={tab === k ? "selected" : ""}
                    onClick={() => setTab(k)}
                  >
                    {
                      {
                        camera: "Payload",
                        radio: "Comms",
                        solar: "Power",
                        battery: "Battery",
                        storage: "Data",
                      }[k]
                    }
                  </button>
                ))}
              </div>
              <div className="option-list">
                {catalog[tab].map((part) => (
                  <button
                    key={part.id}
                    className={
                      "part " + (design[tab] === part.id ? "chosen" : "")
                    }
                    onClick={() => change(tab, part.id)}
                  >
                    <span className="part-icon">
                      {tab === "camera" ? (
                        <ScanLine />
                      ) : tab === "radio" ? (
                        <Radio />
                      ) : tab === "solar" ? (
                        <Sun />
                      ) : tab === "battery" ? (
                        <Shield />
                      ) : (
                        <Satellite />
                      )}
                    </span>
                    <div>
                      <h3>{part.name}</h3>
                      <p>{part.description}</p>
                      <span className="part-spec">
                        {part.mass} KG <b>·</b> ${part.cost}M
                      </span>
                    </div>
                    <span className="radio-circle">
                      {design[tab] === part.id && <Check size={12} />}
                    </span>
                  </button>
                ))}
              </div>
              <div className="included">
                <Check size={14} /> Included: flight bus · hydrogen sensor ·
                propulsion reserve
              </div>
              <div className="field-row">
                <label>
                  MISSION ORBIT
                  <select
                    value={design.orbit}
                    onChange={(ev) => change("orbit", ev.target.value)}
                  >
                    <option value="polar">100 km · Polar survey</option>
                    <option value="high">300 km · Polar survey</option>
                    <option value="equatorial">100 km · Equatorial</option>
                  </select>
                </label>
                <label>
                  LAUNCH SERVICE
                  <select
                    value={design.launcher}
                    onChange={(ev) => change("launcher", ev.target.value)}
                  >
                    <option value="light">Light · 100 kg · $18M</option>
                    <option value="heavy">Heavy · 150 kg · $24M</option>
                  </select>
                </label>
              </div>
              <div className="budget">
                <div>
                  <span>MISSION BUDGET</span>
                  <b className={v.cost > 40 ? "danger" : ""}>
                    ${fmt(v.cost)}
                    <small> / $40M</small>
                  </b>
                </div>
                <div className="bar">
                  <i
                    style={{
                      width: `${Math.min(100, (v.cost / 40) * 100)}%`,
                      background: v.cost > 40 ? "var(--red)" : undefined,
                    }}
                  />
                </div>
                <p>
                  Fictional costs for learning. Every upgrade has a trade-off.
                </p>
              </div>
              <div className="metrics">
                <div>
                  <span>WET MASS</span>
                  <b>
                    {v.mass}
                    <small> kg</small>
                  </b>
                </div>
                <div>
                  <span>PEAK SOLAR</span>
                  <b>
                    {v.solar}
                    <small> W</small>
                  </b>
                </div>
                <div>
                  <span>DOWNLINK</span>
                  <b>
                    {v.downlink}
                    <small> MiB/s</small>
                  </b>
                </div>
              </div>
              <button className="primary" onClick={() => setStage("review")}>
                Review mission <ArrowRight size={18} />
              </button>
              <div className="utility">
                <button onClick={save}>Save design</button>
                <button onClick={load}>Load saved</button>
                <button
                  onClick={() => {
                    setDesign(balancedDesign);
                    setNotice(
                      "Balanced reference loaded. Compare its communications and power needs.",
                    );
                  }}
                >
                  Load reference ↗
                </button>
              </div>
            </>
          ) : stage === "review" ? (
            <>
              <span className="eyebrow">MISSION READINESS / LP–006</span>
              <h2>Your flight review.</h2>
              <p className="lead">
                Ambition is a starting point. Engineering gets it home.
              </p>
              <div className="review-item">
                <Check />
                <div>
                  <h3>Science objective defined</h3>
                  <p>3 paired polar survey cells received on Earth.</p>
                </div>
              </div>
              <div className="review-item">
                <Check />
                <div>
                  <h3>Delivery envelope</h3>
                  <p>
                    {v.mass} kg / {design.launcher === "light" ? 100 : 150} kg ·
                    ${fmt(v.cost)}M allocation used.
                  </p>
                </div>
              </div>
              {r.blockers.map((x) => (
                <div className="review-item bad" key={x}>
                  <AlertTriangle />
                  <p>{x}</p>
                </div>
              ))}
              {r.risks.map((x) => (
                <div className="review-item warn" key={x}>
                  <AlertTriangle />
                  <p>{x}</p>
                </div>
              ))}
              <div className="callout">
                <b>Contracted delivery</b>
                <p>
                  Your service delivers the spacecraft into the selected lunar
                  orbit. This prototype models orbital operations; launch and
                  transfer are abstracted.
                </p>
              </div>
              <button
                className="primary"
                disabled={!!r.blockers.length}
                onClick={launch}
              >
                Commit & deploy <ArrowUpRight size={18} />
              </button>
              <button className="secondary" onClick={() => setStage("build")}>
                Return to assembly
              </button>
            </>
          ) : stage === "flight" ? (
            <>
              <div className="panel-title">
                <div>
                  <span className="eyebrow">LIVE TELEMETRY</span>
                  <h2>Stay ahead of the orbit.</h2>
                </div>
                <span className="pill">
                  <span className="live-dot" /> LIVE
                </span>
              </div>
              <div className="flight-status">
                <span>ORBIT {e.orbit} / 6</span>
                <b>{time(s.t)}</b>
              </div>
              <div className="progress">
                <i
                  style={{ width: `${(s.t / (period(design) * 6)) * 100}%` }}
                />
              </div>
              <div className="telemetry">
                <Meter
                  label="BATTERY"
                  value={`${fmt(s.energy)} / ${v.capacity} Wh`}
                  percent={(s.energy / v.capacity) * 100}
                  warning={s.energy < v.capacity * 0.2}
                />
                <Meter
                  label="RECORDER"
                  value={`${fmt(queued(s))} / ${v.storage} MiB`}
                  percent={(queued(s) / v.storage) * 100}
                  warning={queued(s) > v.storage * 0.85}
                />
              </div>
              <div className="link-status">
                <span className={e.contact ? "ok" : ""}>
                  ● {e.contact ? "EARTH IN VIEW" : "MOON OCCULTATION"}
                </span>
                <span className={e.target ? "ok" : ""}>
                  ● {e.target ? "TARGET WINDOW" : "OUTSIDE TARGET"}
                </span>
              </div>
              <div className="commands">
                {(
                  [
                    {
                      id: "observe",
                      icon: ScanLine,
                      label: "Observe",
                      sub: "Point instrument at target",
                    },
                    {
                      id: "downlink",
                      icon: Radio,
                      label: "Downlink",
                      sub: "Point antenna toward Earth",
                    },
                    {
                      id: "charge",
                      icon: Sun,
                      label: "Charge",
                      sub: "Face solar wings toward Sun",
                    },
                    {
                      id: "safe",
                      icon: Shield,
                      label: "Safe mode",
                      sub: "Reduce load to 5 W",
                    },
                  ] as const
                ).map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => mode(m.id)}
                    className={s.mode === m.id ? "engaged" : ""}
                  >
                    <m.icon size={19} />
                    <span>
                      <b>{m.label}</b>
                      <small>{m.sub}</small>
                    </span>
                    <kbd>{i + 1}</kbd>
                  </button>
                ))}
              </div>
              <div className="transport">
                <button
                  aria-label={paused ? "Resume" : "Pause"}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <select
                  aria-label="Simulation speed"
                  value={speed}
                  onChange={(ev) => setSpeed(+ev.target.value)}
                >
                  {[1, 30, 60, 120, 600].map((x) => (
                    <option value={x} key={x}>
                      {x}× TIME
                    </option>
                  ))}
                </select>
                <label>
                  <input
                    type="checkbox"
                    checked={auto}
                    onChange={(ev) => setAuto(ev.target.checked)}
                  />{" "}
                  Auto operator
                </label>
              </div>
              <div className="survey-grid" aria-label="Received science map">
                {Array.from({ length: 24 }, (_, i) => (
                  <span
                    key={i}
                    className={
                      s.received[`${i}-proxy`] && s.received[`${i}-context`]
                        ? "complete"
                        : s.received[`${i}-proxy`] || s.received[`${i}-context`]
                          ? "partial"
                          : ""
                    }
                    title={`Cell ${i}: ${s.received[`${i}-proxy`] && s.received[`${i}-context`] ? "paired evidence received" : "incomplete"}`}
                  >
                    {i.toString().padStart(2, "0")}
                  </span>
                ))}
              </div>
              <div className="science-count">
                <b>
                  {sc.cells}
                  <small> / 3 CELLS</small>
                </b>
                <span>PAIRED EVIDENCE RECEIVED</span>
              </div>
              <div className="event-log" aria-live="polite">
                {s.events
                  .slice(-3)
                  .reverse()
                  .map((x, i) => (
                    <p key={x.t + "-" + i} className={x.kind}>
                      <time>{time(x.t)}</time>
                      {x.message}
                    </p>
                  ))}
              </div>
              <button
                className="text-button"
                onClick={() => {
                  s.ended = true;
                  setStage("report");
                  setPaused(true);
                }}
              >
                End mission & inspect results →
              </button>
            </>
          ) : (
            <>
              <span className="eyebrow">POST-MISSION ANALYSIS</span>
              <h2>
                {sc.cells >= 3
                  ? "Evidence, delivered."
                  : "A lesson from the Moon."}
              </h2>
              <div className="report-score">
                <b>
                  {sc.score}
                  <small>/100</small>
                </b>
                <span>
                  {sc.cells >= 3
                    ? "OBJECTIVE ACHIEVED"
                    : "OBJECTIVE INCOMPLETE"}
                </span>
              </div>
              <div className="report-stats">
                <div>
                  <span>GENERATED</span>
                  <b>{fmt(s.generated)} MiB</b>
                </div>
                <div>
                  <span>RECEIVED</span>
                  <b>{fmt(s.sent)} MiB</b>
                </div>
                <div>
                  <span>STILL ONBOARD</span>
                  <b>{fmt(queued(s))} MiB</b>
                </div>
                <div>
                  <span>PAIRED CELLS</span>
                  <b>{sc.cells} / 3</b>
                </div>
              </div>
              <div className="callout">
                <b>What shaped the outcome?</b>
                <p>
                  {design.orbit === "equatorial"
                    ? "Your orbit never crossed the polar target. Instruments cannot compensate for missing coverage."
                    : queued(s) > 10
                      ? `${fmt(queued(s))} MiB remained aboard. More downlink time or higher throughput could help; rerun to test it.`
                      : sc.cells >= 3
                        ? "Your operating plan returned complementary evidence. Compare quality, cost and energy margins on the next run."
                        : "The objective needs both hydrogen-proxy and context packets received. Check targeting, pointing, energy and downlink time."}
                </p>
              </div>
              {previous && (
                <div className="comparison">
                  <span>PREVIOUS RUN → THIS RUN</span>
                  <b>
                    {previous.cells} → {sc.cells} paired cells
                  </b>
                  <small>
                    ${previous.cost}M → ${v.cost}M · Hardware and operating
                    choices may differ.
                  </small>
                </div>
              )}
              <div className="event-log">
                {s.events
                  .filter((x) => x.kind === "warning")
                  .slice(-3)
                  .map((x, i) => (
                    <p key={i} className="warning">
                      <time>{time(x.t)}</time>
                      {x.message}
                    </p>
                  ))}
              </div>
              <button className="primary" onClick={redesign}>
                Redesign & fly again <RotateCcw size={17} />
              </button>
              <button className="secondary" onClick={benchmark}>
                Compute automated comparison
              </button>
              <button className="text-button" onClick={download}>
                <Download size={14} /> Export mission report
              </button>
            </>
          )}
        </aside>
      </main>
      <footer>
        <span>
          <span className="live-dot" /> ALL SYSTEMS EXPLAINABLE
        </span>
        <span>
          NASA-informed. Curiosity-driven.{" "}
          <button onClick={() => setSources(true)}>Explore the model ↗</button>
        </span>
        <span>ONE MISSION. MANY POSSIBLE ANSWERS.</span>
      </footer>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button onClick={() => setNotice("")}>×</button>
        </div>
      )}
      {brief && (
        <div className="overlay">
          <div className="modal briefing">
            <span className="eyebrow">INCOMING / LUNAR SCIENCE TEAM</span>
            <div className="brief-symbol">
              <Satellite size={48} />
            </div>
            <h2>
              The Moon is waiting.
              <br />
              <em>What will you send?</em>
            </h2>
            <p>
              We need evidence to prioritize the next south-polar survey. You
              have <b>$40 million</b>, six orbits, and a spacecraft of your own
              design.
            </p>
            <p>
              A better camera means more data. A bigger antenna means more
              power. Your job is to make the whole mission work—and bring the
              evidence home.
            </p>
            <div className="brief-steps">
              <span>01 BUILD</span>
              <ArrowRight size={15} />
              <span>02 OPERATE</span>
              <ArrowRight size={15} />
              <span>03 LEARN</span>
            </div>
            <button
              className="primary"
              onClick={() => {
                setBrief(false);
                localStorage.setItem("ols-intro", "1");
              }}
            >
              Enter the assembly bay <ArrowRight size={18} />
            </button>
            <small>
              8–12 minute mission · Single player · No account required
            </small>
          </div>
        </div>
      )}
      {sources && (
        <div className="overlay">
          <div className="modal sources">
            <button className="close" onClick={() => setSources(false)}>
              ×
            </button>
            <span className="eyebrow">MISSION NOTES</span>
            <h2>
              Real inspiration.
              <br />
              Transparent assumptions.
            </h2>
            <p>
              This educational prototype uses a spherical Moon and analytic
              circular orbits. Earth/Sun directions are frozen during six
              representative orbits. Power, pointing, occultation, finite
              storage and transmission interact. It is not a flight-qualified
              mission analysis tool.
            </p>
            <h3>Science with context</h3>
            <p>
              Hydrogen-proxy observations indicate possible follow-up regions;
              ordinary images cannot prove ice in permanent shadow. Gameplay
              readings, component specs and dollar costs are synthetic.
            </p>
            <ul>
              <li>
                <a
                  href="https://ssd.jpl.nasa.gov/astro_par.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  JPL lunar gravity
                </a>{" "}
                · μ = 4.902800118 × 10¹² m³/s²
              </li>
              <li>
                <a
                  href="https://ssd.jpl.nasa.gov/sats/phys_par/sep.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Lunar mean radius
                </a>{" "}
                · 1,737,400 m
              </li>
              <li>
                <a
                  href="https://science.nasa.gov/mission/lro/spacecraft-and-instruments/"
                  target="_blank"
                  rel="noreferrer"
                >
                  NASA LRO instruments
                </a>{" "}
                · Measurement compatibility
              </li>
              <li>
                <a
                  href="https://svs.gsfc.nasa.gov/4720/"
                  target="_blank"
                  rel="noreferrer"
                >
                  NASA CGI Moon Kit
                </a>{" "}
                · Lunar texture, NASA/GSFC/Scientific Visualization Studio
              </li>
              <li>
                <a
                  href="https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Space Apps challenge
                </a>{" "}
                · Complete mission-design learning
              </li>
            </ul>
            <p>
              Original concept: participant. AI assistance: technical planning,
              implementation and debugging. No NASA endorsement. Science is
              credited once per unique cell and measurement; repeat observations
              do not multiply credit.
            </p>
            <label>
              <input
                type="checkbox"
                checked={reduced}
                onChange={(ev) => setReduced(ev.target.checked)}
              />{" "}
              Reduce background motion
            </label>
            <button className="primary" onClick={() => setSources(false)}>
              Back to mission <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function Meter({
  label,
  value,
  percent,
  warning,
}: {
  label: string;
  value: string;
  percent: number;
  warning?: boolean;
}) {
  return (
    <div className="meter">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <div className={"bar " + (warning ? "warning" : "")}>
        <i style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
