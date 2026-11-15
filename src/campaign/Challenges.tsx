import { useEffect, useRef, useState } from "react";
import { Radio, Sun, Camera, ArrowRight, Pause, Play } from "lucide-react";
import {
  bodies,
  loads,
  newOrbit,
  orbitEnvironment,
  orbitPeriod,
  orbitStep,
  orbitGoal,
  orbitPassed,
  orbitKit,
  newMotion,
  motionStep,
  type World,
  type Result,
} from "./model";
import { Coach, unseen, markSeen } from "./Coach";
import { deriveBuild, starterBuild, type FlightKit } from "./workshop";
import {
  newSignal,
  signalStep,
  signalEnvironment,
  signalDuration,
  signalScore,
} from "./signal";
function useFrames(step: (dt: number) => void) {
  const live = useRef(step);
  live.current = step;
  useEffect(() => {
    let raf = 0,
      last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      live.current(dt);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
}
export function SignalChallenge({
  onDone,
  tier = 0,
  suspended = false,
  kit: provided,
}: {
  onDone: (r: Result) => void;
  tier?: number;
  suspended?: boolean;
  kit?: FlightKit;
}) {
  const kit = provided ?? deriveBuild(starterBuild(tier), tier),
    key = `signal-v4-${tier}`;
  const [guide, setGuide] = useState(() => unseen(key)),
    state = useRef(newSignal(kit, tier)),
    [, paint] = useState(0),
    reported = useRef(false);
  const a = state.current,
    e = signalEnvironment(a, tier),
    required = 2 + tier * 2;
  useFrames((dt) => {
    if (suspended || guide || a.status !== "active") return;
    const advanced = signalStep(a, kit, tier, dt);
    paint((n) => n + 1);
    if (advanced.status === "failed" && !reported.current) {
      reported.current = true;
      onDone({
        success: false,
        score: 0,
        reason: a.reason,
        stats: [
          {
            label: "Message received",
            value: `${Math.round((a.signal / required) * 100)}%`,
          },
          { label: "Battery remaining", value: `${a.energy.toFixed(3)} Wh` },
          {
            label: "Elapsed contact window",
            value: `${a.t.toFixed(1)} / ${signalDuration(tier)} s`,
          },
        ],
      });
    }
  });
  return (
    <div className="career-challenge">
      <div className="signal-stage">
        <div className="signal-earth">🌍</div>
        <div className={"signal-satellite " + (a.panels ? "wings-open" : "")}>
          <i />
          <span>🛰</span>
          <i />
        </div>
        {a.tx && e.aligned && (
          <div className="signal-waves">
            <i />
            <i />
            <i />
          </div>
        )}
        <span className="challenge-sky-label">
          YOUR SATELLITE · {e.dark ? "IN SHADOW" : "SUNLIGHT"} ·{" "}
          {tier === 0
            ? "FIRST CONTACT"
            : tier === 1
              ? "ANTENNA TRAINING"
              : "POWER RESCUE"}
        </span>
      </div>
      <div className="career-controls">
        <div className="challenge-help">
          <span className="eyebrow">SATELLITE ASSIGNMENT {tier + 1} / 3</span>
          <button className="text-button" onClick={() => setGuide(true)}>
            ⓘ Walkthrough
          </button>
        </div>
        <h2>
          {tier === 0
            ? "Bring your satellite online."
            : tier === 1
              ? "Point before you transmit."
              : "Rescue the low battery."}
        </h2>
        <p>
          Deploy power, establish a radio link, and return the complete test
          message before the contact window closes. Your selected hardware
          determines available power, battery reserve and radio speed.
        </p>
        <div className="attempt-clock" data-guide="signal-time">
          <span>CONTACT WINDOW</span>
          <b className={signalDuration(tier) - a.t < 12 ? "danger" : ""}>
            {Math.max(0, Math.ceil(signalDuration(tier) - a.t))}s
          </b>
          <small>
            {guide
              ? "Paused for walkthrough"
              : "Battery depletion or a missed deadline fails the assignment."}
          </small>
        </div>
        <div className="career-meter" data-guide="signal-energy">
          <span>
            BATTERY{" "}
            <b>
              {a.energy.toFixed(3)} / {kit.battery} Wh
            </b>
          </span>
          <i>
            <em style={{ width: `${(a.energy / kit.battery) * 100}%` }} />
          </i>
        </div>
        <p
          className={
            "signal-power " +
            (a.tx && (!a.panels || kit.radioW + 8 > kit.solar) ? "danger" : "")
          }
        >
          {a.panels && !e.dark ? kit.solar : 0} W generation ·{" "}
          {8 + (a.tx ? kit.radioW : 0)} W consumption{" "}
          {a.tx && !a.panels
            ? "— radio is draining the undeployed satellite’s battery"
            : ""}
        </p>
        <div className="goal-checks">
          <span className={a.panels ? "met" : ""}>
            {a.panels ? "✓" : "○"} Solar wings deployed
          </span>
          {tier > 0 && (
            <span className={e.aligned || a.signal >= required ? "met" : ""}>
              {e.aligned || a.signal >= required ? "✓" : "○"} Antenna aligned
              while transmitting
            </span>
          )}
          <span className={a.signal >= required ? "met" : ""}>
            {a.signal >= required ? "✓" : "○"} {required} MiB received on Earth
          </span>
        </div>
        <button
          className="secondary"
          data-guide="signal-panels"
          disabled={a.panels || a.status !== "active"}
          onClick={() => {
            a.panels = true;
            paint((n) => n + 1);
          }}
        >
          <Sun size={17} />
          {a.panels ? "Solar wings open" : "Deploy solar wings"}
        </button>
        {tier > 0 && (
          <label className="throttle-control" data-guide="signal-aim">
            ANTENNA AIM · TARGET {e.target.toFixed(0)}° <b>{a.aim}°</b>
            <input
              aria-label="Antenna aim"
              type="range"
              min="-20"
              max="20"
              value={a.aim}
              onChange={(ev) => {
                a.aim = +ev.target.value;
                paint((n) => n + 1);
              }}
            />
            <small>
              {e.aligned
                ? "Link aligned."
                : "Off-target transmission consumes power without returning data."}
            </small>
          </label>
        )}
        <button
          className="primary"
          data-guide="signal-radio"
          disabled={a.status !== "active"}
          onClick={() => {
            a.tx = !a.tx;
            paint((n) => n + 1);
          }}
        >
          {a.tx ? "Pause transmission" : "Transmit signal"}
          <Radio size={17} />
        </button>
        <div className="career-meter">
          <span>
            RECEIVED ON EARTH <b>{Math.round((a.signal / required) * 100)}%</b>
          </span>
          <i>
            <em style={{ width: `${(a.signal / required) * 100}%` }} />
          </i>
        </div>
        <button
          className="primary"
          disabled={a.status !== "ready"}
          onClick={() => {
            if (reported.current) return;
            reported.current = true;
            onDone({
              success: true,
              score: signalScore(a, kit, tier),
              reason:
                "Your chosen spacecraft returned its message before the deadline and kept power. The next assignment is earned.",
              stats: [
                { label: "Message delivered", value: "100%" },
                {
                  label: "Battery reserve",
                  value: `${Math.round((a.energy / kit.battery) * 100)}%`,
                },
                {
                  label: "Contact time used",
                  value: `${a.t.toFixed(1)} / ${signalDuration(tier)} s`,
                },
              ],
            });
          }}
        >
          Complete satellite assignment <ArrowRight size={17} />
        </button>
        <p className="career-micro">
          Fictional commissioning test · power integrates W × seconds / 3600
          into Wh · timers pause while walkthrough tips are open
        </p>
      </div>
      {guide && (
        <Coach
          steps={[
            {
              title: "This attempt can fail.",
              body: `Return the full message within ${signalDuration(tier)} seconds. If the battery reaches zero or you miss the window, retry or redesign. The clock is paused while you read.`,
              target: '[data-guide="signal-time"]',
            },
            {
              title: "Your battery is a limited reserve.",
              body: `You chose a ${kit.battery} Wh battery and ${kit.solar} W panels. The computer always draws 8 W. Turning on the radio adds ${kit.radioW} W. Watch generation versus consumption.`,
              target: '[data-guide="signal-energy"]',
            },
            {
              title: "Power first is a sensible strategy.",
              body: "Open the solar wings to generate electricity in sunlight. Transmitting while they are closed is allowed, but can exhaust the battery before the message finishes.",
              target: '[data-guide="signal-panels"]',
            },
            ...(tier > 0
              ? [
                  {
                    title: "Pointing matters.",
                    body:
                      tier === 2
                        ? "The target drifts. Track the indicated angle while protecting your battery in shadow. Poor alignment wastes radio power."
                        : "Move the antenna near the target angle before transmitting. Off-target data never reaches Earth.",
                    target: '[data-guide="signal-aim"]',
                  },
                ]
              : []),
            {
              title: "Now make your own attempt.",
              body: "Transmit only when your power and pointing plan can support it. Pausing the radio to recharge is a valid decision. For a higher rating, finish promptly with more battery reserve.",
              target: '[data-guide="signal-radio"]',
            },
          ]}
          onClose={() => {
            markSeen(key);
            setGuide(false);
          }}
        />
      )}
    </div>
  );
}
export function OrbitChallenge({
  world,
  load,
  onDone,
  tier = 0,
  suspended = false,
  kit: equipment,
}: {
  world: World;
  load: number;
  kit?: FlightKit;
  onDone: (r: Result) => void;
  tier?: number;
  suspended?: boolean;
}) {
  const guideKey = `orbit-v4-${world}-${tier}`;
  const [guide, setGuide] = useState(() => unseen(guideKey));
  const state = useRef({
      ...newOrbit(load),
      energy: orbitKit(load, tier, equipment).battery * (0.7 - tier * 0.06),
    }),
    [, paint] = useState(0),
    [paused, setPaused] = useState(false),
    [speed, setSpeed] = useState(80),
    done = useRef(false),
    lastPaint = useRef(0);
  const s = state.current,
    l = orbitKit(load, tier, equipment),
    e = orbitEnvironment(s, world),
    goal = orbitGoal(world, tier),
    b = bodies[world];
  function finish(success: boolean) {
    if (done.current) return;
    done.current = true;
    const score = success
      ? Math.min(
          100,
          Math.round(
            65 +
              (s.energy / l.battery) * 20 +
              (l.quality - 1) * 30 +
              (s.delivered.length - goal) * 5,
          ),
        )
      : 0;
    onDone({
      success,
      score,
      reason: success
        ? `Your ${world === "earth" ? "photos" : "survey observations"} made it home, and you kept your explorer powered.`
        : s.reason,
      stats: [
        { label: "Areas received", value: `${s.delivered.length} / ${goal}` },
        {
          label: "Battery remaining",
          value: `${Math.round((s.energy / l.battery) * 100)}%`,
        },
        { label: "Data received", value: `${s.sent.toFixed(1)} MiB` },
      ],
    });
  }
  useFrames((dt) => {
    if (paused || suspended || guide || done.current) return;
    orbitStep(s, world, load, dt * speed, tier, equipment);
    lastPaint.current += dt;
    if (lastPaint.current > 0.08) {
      paint((n) => n + 1);
      lastPaint.current = 0;
    }
    if (s.ended) finish(false);
  });
  function coast() {
    if (done.current) return;
    s.mode = "charge";
    let leaving = e.target;
    for (let t = 0; t < orbitPeriod(world) && !s.ended; t += 10) {
      orbitStep(s, world, load, 10, tier, equipment);
      const current = orbitEnvironment(s, world);
      if (leaving && !current.target) leaving = false;
      if (!leaving && current.target) break;
    }
    setPaused(true);
    paint((n) => n + 1);
    if (s.ended) finish(false);
  }
  const goals = [
    {
      text: `Return observations from ${goal} different areas`,
      met: s.delivered.length >= goal,
    },
    {
      text:
        world === "earth"
          ? `Survive ${180 * (tier + 1)} simulated seconds of eclipse`
          : "Return at least 85% of collected data",
      met:
        world === "earth"
          ? s.eclipseTime >= 180 * (tier + 1)
          : s.generated > 0 && s.sent >= s.generated * 0.85,
    },
    {
      text: `Finish with at least ${10 + tier * 5}% battery`,
      met: s.energy >= l.battery * (0.1 + tier * 0.05),
    },
  ];
  return (
    <div className="career-challenge">
      <div className={"career-orbit world-" + world}>
        <span className="challenge-sky-label">
          {b.name.toUpperCase()} ORBIT · {Math.floor(s.t / 60)} SIM MIN ·{" "}
          {e.eclipse ? "IN DARKNESS" : "SUNLIT"}
        </span>
        <svg
          viewBox="0 0 600 500"
          role="img"
          aria-label={`Satellite around ${b.name}; ${e.target ? "survey window open" : "outside survey region"}`}
        >
          <defs>
            <radialGradient id="career-body">
              <stop stopColor={b.color} />
              <stop offset="1" stopColor="#17252e" />
            </radialGradient>
          </defs>
          <circle
            cx="290"
            cy="245"
            r="172"
            fill="none"
            stroke="#56776c"
            strokeDasharray="4 7"
          />
          <circle cx="290" cy="245" r="116" fill="url(#career-body)" />
          {world === "earth" && (
            <>
              <path
                d="M 235 170 L 266 158 281 204 249 232 230 215 Z M 298 248 L 330 240 350 270 324 317 306 290Z"
                fill="#82a96b"
                opacity=".6"
              />
            </>
          )}
          {world !== "earth" && (
            <>
              <circle cx="250" cy="210" r="24" fill="#111a2322" />
              <circle cx="324" cy="280" r="32" fill="#111a2322" />
            </>
          )}
          <text
            x="290"
            y="245"
            textAnchor="middle"
            fill="#e4efde"
            fontSize="17"
            letterSpacing="4"
          >
            {b.name.toUpperCase()}
          </text>
          <path
            d={
              world === "earth"
                ? "M 153 141 A 172 172 0 0 1 427 141"
                : "M 153 349 A 172 172 0 0 0 427 349"
            }
            fill="none"
            stroke="#c4f38c"
            strokeWidth="8"
            opacity=".55"
          />
          {s.mode === "observe" && e.target && (
            <line
              x1={290 + 172 * Math.cos(e.angle)}
              y1={245 - 172 * Math.sin(e.angle)}
              x2="290"
              y2="245"
              stroke="#b9ec8f"
              strokeDasharray="4 5"
            />
          )}
          <g
            transform={`translate(${290 + 172 * Math.cos(e.angle)},${245 - 172 * Math.sin(e.angle)}) rotate(${(-e.angle * 180) / Math.PI})`}
          >
            <rect x="-19" y="-7" width="12" height="14" fill="#428abe" />
            <rect x="7" y="-7" width="12" height="14" fill="#428abe" />
            <rect x="-6" y="-6" width="12" height="12" fill="#e8dfbd" />
          </g>
          <text
            x="290"
            y="460"
            textAnchor="middle"
            fill="#8eaa9d"
            fontSize="11"
          >
            {e.target
              ? "SURVEY WINDOW OPEN"
              : "CIRCLING TO THE NEXT SURVEY AREA"}
          </text>
        </svg>
        <div className="orbital-captures">
          {Array.from({ length: goal }, (_, i) => (
            <div key={i} className={i < s.delivered.length ? "received" : ""}>
              <Camera size={22} />
              <span>
                {i < s.delivered.length ? "RECEIVED" : `AREA ${i + 1}`}
              </span>
            </div>
          ))}
        </div>
        <p className="career-micro">
          Analytic circular orbit · schematic not to scale · synthetic training
          measurements
        </p>
      </div>
      <div className="career-controls">
        <button className="text-button" onClick={() => setGuide(true)}>
          ⓘ Walkthrough
        </button>
        <span className="eyebrow">
          {world === "earth"
            ? "EARTH OBSERVER"
            : world === "moon"
              ? "LUNAR SCIENCE"
              : "MARS RECONNAISSANCE"}
        </span>
        <h2>
          {s.delivered.length >= goal
            ? "Bring it home."
            : "Make every pass count."}
        </h2>
        <p>
          {s.energy < l.battery * 0.2
            ? "Low battery! Turn toward sunlight before another dark section."
            : s.queue.reduce((n, p) => n + p.remaining, 0) > l.storage * 0.8
              ? "Your recorder is nearly full. Send the stored observations home."
              : e.target
                ? "A survey area is below you. Observe to capture it, then transmit while the ground link is open."
                : "Prepare power or send stored pictures home. Your next survey pass is coming."}
        </p>
        <div className="goal-checks">
          {goals.map((g) => (
            <span key={g.text} className={g.met ? "met" : ""}>
              {g.met ? "✓" : "○"} {g.text}
            </span>
          ))}
        </div>
        <div className="career-meters" data-guide="orbit-resources">
          <div className="career-meter">
            <span>
              BATTERY{" "}
              <b>
                {s.energy.toFixed(0)} / {l.battery} Wh
              </b>
            </span>
            <i>
              <em style={{ width: `${(s.energy / l.battery) * 100}%` }} />
            </i>
          </div>
          <div className="career-meter">
            <span>
              STORED DATA{" "}
              <b>
                {s.queue.reduce((n, p) => n + p.remaining, 0).toFixed(0)} /{" "}
                {l.storage} MiB
              </b>
            </span>
            <i>
              <em
                style={{
                  width: `${(s.queue.reduce((n, p) => n + p.remaining, 0) / l.storage) * 100}%`,
                }}
              />
            </i>
          </div>
        </div>
        <div className="career-status">
          <span>
            {e.contact ? "● GROUND LINK OPEN" : "○ GROUND LINK BLOCKED"}
          </span>
          <span>{e.eclipse ? "◐ ECLIPSE" : "☀ SUNLIGHT"}</span>
        </div>
        <div className="career-mode-buttons" data-guide="orbit-commands">
          {(
            [
              { mode: "observe", label: "Observe", icon: Camera },
              { mode: "transmit", label: "Send home", icon: Radio },
              { mode: "charge", label: "Charge", icon: Sun },
            ] as const
          ).map((m) => (
            <button
              key={m.mode}
              className={s.mode === m.mode ? "selected" : ""}
              onClick={() => {
                s.mode = m.mode;
                setPaused(false);
                paint((n) => n + 1);
              }}
            >
              <m.icon size={21} />
              {m.label}
            </button>
          ))}
        </div>
        <div className="exposure-meter">
          <span>
            Camera exposure{" "}
            {e.target && s.mode === "observe"
              ? Math.min(100, Math.round((s.exposure / 35) * 100))
              : 0}
            %
          </span>
          <span>
            {s.seen.length} captured · {s.delivered.length} received
          </span>
        </div>
        <div className="career-time" data-guide="orbit-time">
          <button onClick={() => setPaused(!paused)}>
            {paused ? <Play size={14} /> : <Pause size={14} />}{" "}
            {paused ? "Resume" : "Pause"}
          </button>
          <select
            aria-label="Career simulation speed"
            value={speed}
            onChange={(ev) => setSpeed(+ev.target.value)}
          >
            <option value="40">40× time</option>
            <option value="80">80× time</option>
            <option value="160">160× time</option>
          </select>
          <button onClick={coast}>Coast to next survey</button>
        </div>
        {world === "mars" && (
          <p className="career-tip">
            Mars challenge: solar output is reduced to 50% and the illustrative
            downlink to 22%. These are game-balancing factors, not a full RF or
            solar-array model.
          </p>
        )}
        <button
          className="primary"
          disabled={!orbitPassed(s, world, load, tier, equipment)}
          onClick={() => finish(true)}
        >
          Complete orbital mission <ArrowRight size={17} />
        </button>
      </div>
      {guide && (
        <Coach
          steps={[
            {
              title: "Plan the whole observation cycle.",
              body: `Return ${goal} different areas, meet the battery reserve, and avoid missing the mission deadline. Pictures still onboard do not count.`,
            },
            {
              title: "Your hardware sets the limits.",
              body: "Battery, solar generation, radio rate and recorder capacity come from the spacecraft you built. Too many images or a long eclipse can exhaust a poor design.",
              target: '[data-guide="orbit-resources"]',
            },
            {
              title: "Choose one task at a time.",
              body: "Observe collects when a target is visible. Send home transmits only during ground contact. Charge saves power and points the panels toward sunlight.",
              target: '[data-guide="orbit-commands"]',
            },
            {
              title: "Watch time and contact windows.",
              body: "Coasting consumes mission time and power normally. Miss enough windows and the mission ends. Try a design, inspect its result, then improve it.",
              target: '[data-guide="orbit-time"]',
            },
          ]}
          onClose={() => {
            markSeen(guideKey);
            setGuide(false);
          }}
        />
      )}
    </div>
  );
}
export function ManeuverChallenge({
  kind,
  world,
  onDone,
  tier = 0,
  suspended = false,
  kit: equipment,
}: {
  kind: "dock" | "land";
  kit?: FlightKit;
  world: World;
  onDone: (r: Result) => void;
  tier?: number;
  suspended?: boolean;
}) {
  const guideKey = `maneuver-v4-${kind}-${world}-${tier}`;
  const [guide, setGuide] = useState(() => unseen(guideKey));
  const state = useRef({
      ...newMotion(kind, world, tier),
      ...(equipment
        ? {
            fuel:
              kind === "land"
                ? equipment.surfaceFuel
                : newMotion(kind, world, tier).fuel * equipment.fuelScale,
            dryMass: equipment.dryMass,
          }
        : {}),
      assist: false,
    }),
    [, paint] = useState(0),
    [paused, setPaused] = useState(false),
    keys = useRef({ x: 0, y: 0 }),
    ended = useRef(false),
    assisted = useRef(false),
    timer = useRef(0);
  const s = state.current;
  useFrames((dt) => {
    if (paused || suspended || guide || ended.current) return;
    timer.current += dt;
    assisted.current ||= s.assist;
    motionStep(
      s,
      kind,
      world,
      dt * (kind === "dock" ? 4 : 2),
      keys.current,
      tier,
    );
    paint((n) => n + 1);
    if (s.status !== "active") {
      ended.current = true;
      const success = s.status === "success";
      onDone({
        success,
        score: success
          ? Math.min(
              assisted.current ? 79 : 100,
              Math.round(
                (assisted.current ? 66 : 82) +
                  s.fuel * 0.35 -
                  Math.abs(s.vx) * 3 -
                  s.impact * 2,
              ),
            )
          : 0,
        reason: success
          ? kind === "dock"
            ? "Module attached. Your first station has a science lab!"
            : `Touchdown on the ${world === "moon" ? "Moon" : "surface of Mars"}. You brought the lander down in one piece.`
          : kind === "dock"
            ? "Approach was too fast or off-center. Brake before contact and aim for the green alignment zone."
            : "Touchdown was too hard or outside the landing zone. Brake earlier and cancel sideways drift.",
        stats: [
          {
            label: kind === "dock" ? "Contact speed" : "Touchdown speed",
            value: `${s.impact.toFixed(2)} m/s`,
          },
          { label: "Fuel remaining", value: `${s.fuel.toFixed(1)}` },
          {
            label: "Landing / docking offset",
            value: `${Math.abs(s.x).toFixed(1)} m`,
          },
          {
            label: "Assistance used",
            value: assisted.current ? "Yes" : "Manual",
          },
        ],
      });
    }
  });
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (suspended || guide) return;
      if (
        ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      if (["ArrowLeft", "a"].includes(e.key)) {
        e.preventDefault();
        keys.current.x = -1;
        s.assist = false;
        if (kind === "land") s.angle = Math.max(-30, s.angle - 2);
      }
      if (["ArrowRight", "d"].includes(e.key)) {
        e.preventDefault();
        keys.current.x = 1;
        s.assist = false;
        if (kind === "land") s.angle = Math.min(30, s.angle + 2);
      }
      if (["ArrowUp", "w"].includes(e.key)) {
        e.preventDefault();
        keys.current.y = -1;
        s.assist = false;
        if (kind === "land") s.throttle = Math.min(1, s.throttle + 0.04);
      }
      if (["ArrowDown", "s"].includes(e.key)) {
        e.preventDefault();
        keys.current.y = 1;
        s.assist = false;
        if (kind === "land") s.throttle = Math.max(0, s.throttle - 0.04);
      }
    };
    const up = () => (keys.current = { x: 0, y: 0 });
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", up);
      keys.current = { x: 0, y: 0 };
    };
  }, [suspended, guide]);
  function thrust(x: number, y: number) {
    s.assist = false;
    keys.current = { x, y };
  }
  const mx = 300 + s.x * (kind === "dock" ? 4 : 0.8),
    my =
      kind === "dock"
        ? Math.min(410, 80 + s.y * 3)
        : Math.max(65, 410 - s.y * 0.55);
  return (
    <div className="career-challenge">
      <div
        className={"maneuver-view " + (world === "mars" ? "mars-surface" : "")}
      >
        <span className="challenge-sky-label">
          {kind === "dock"
            ? "STATION CONSTRUCTION · RELATIVE MOTION"
            : `${bodies[world].name.toUpperCase()} · POWERED DESCENT`}
        </span>
        <svg
          viewBox="0 0 600 500"
          role="img"
          aria-label={
            kind === "dock"
              ? "Module approaching a space station"
              : "Lander descending toward a marked landing pad"
          }
        >
          {kind === "dock" ? (
            <>
              <circle cx="90" cy="520" r="280" fill="#205069" />
              <g transform="translate(300,60)">
                <rect
                  x="-65"
                  y="-11"
                  width="130"
                  height="22"
                  rx="7"
                  fill="#d5d8cd"
                />
                <rect x="-115" y="-32" width="42" height="64" fill="#3d86ba" />
                <rect x="73" y="-32" width="42" height="64" fill="#3d86ba" />
                <rect x="-8" y="10" width="16" height="14" fill="#c4f38c" />
              </g>
              <rect
                x={300 - (2 - tier * 0.4) * 4}
                y="80"
                width={(2 - tier * 0.4) * 8}
                height="330"
                fill="#c4f38c09"
                stroke="#739556"
                strokeDasharray="4 6"
              />
              <text
                x="300"
                y="35"
                fill="#b3d6a3"
                fontSize="10"
                textAnchor="middle"
              >
                DOCKING PORT
              </text>
            </>
          ) : (
            <>
              <path
                d="M 0 415 L 70 397 140 418 210 403 255 415 345 415 410 405 480 419 550 395 600 410 V500 H0Z"
                fill={world === "mars" ? "#8c4f35" : "#4a5359"}
              />
              <rect
                x={300 - (35 - tier * 10) * 0.8}
                y="413"
                width={(35 - tier * 10) * 1.6}
                height="5"
                fill="#b5ef7f"
              />
              <text
                x="300"
                y="453"
                fill="#b4d29d"
                fontSize="11"
                textAnchor="middle"
              >
                LANDING ZONE
              </text>
              <line
                x1="300"
                y1="70"
                x2="300"
                y2="410"
                stroke="#697952"
                strokeDasharray="5 8"
              />
            </>
          )}
          <g transform={`translate(${mx},${my}) rotate(${s.angle})`}>
            <rect
              x="-12"
              y="-15"
              width="24"
              height="30"
              rx="4"
              fill="#d8bb78"
            />
            <rect x="-6" y="-9" width="12" height="8" fill="#68c1ce" />
            {kind === "land" && (
              <>
                <path
                  d="M -9 8 L -20 22 H -27 M 9 8 L 20 22 H27"
                  fill="none"
                  stroke="#c9d0bd"
                  strokeWidth="3"
                />
                {s.throttle > 0.05 && s.fuel > 0 && (
                  <path
                    d={`M -5 15 L 0 ${25 + s.throttle * 30} 5 15 Z`}
                    fill="#ffc06a"
                  />
                )}
              </>
            )}
          </g>
          <text x="30" y="475" fill="#72978d" fontSize="9">
            SIMPLIFIED LOCAL PHYSICS · NOT FULL RENDEZVOUS / ATMOSPHERIC ENTRY
          </text>
        </svg>
      </div>
      <div className="career-controls">
        <button className="text-button" onClick={() => setGuide(true)}>
          ⓘ Walkthrough
        </button>
        <span className="eyebrow">
          {kind === "dock"
            ? "BUILD YOUR FIRST SPACE STATION"
            : "THE LAST FEW METERS"}
        </span>
        <h2>{kind === "dock" ? "Slow is smooth." : "A gentle touchdown."}</h2>
        <p>
          {kind === "dock"
            ? "Line up with the green corridor, then approach gently. Thrusters change your speed; releasing them does not stop your motion. Push the opposite way to brake."
            : "Use engine thrust to slow your fall. Tilt to steer, then cancel sideways motion before landing. The green strip is your target."}
        </p>
        <div className="maneuver-stats" data-guide="maneuver-state">
          <div>
            <span>{kind === "dock" ? "DISTANCE" : "HEIGHT"}</span>
            <b>{Math.max(0, s.y).toFixed(0)} m</b>
          </div>
          <div>
            <span>{kind === "dock" ? "CLOSING SPEED" : "FALL SPEED"}</span>
            <b>{(-s.vy).toFixed(1)} m/s</b>
          </div>
          <div>
            <span>SIDEWAYS</span>
            <b>{s.vx.toFixed(1)} m/s</b>
          </div>
          <div>
            <span>FUEL</span>
            <b>{s.fuel.toFixed(1)}</b>
          </div>
        </div>
        <label className="assist-toggle">
          <input
            type="checkbox"
            checked={s.assist}
            onChange={(ev) => {
              s.assist = ev.target.checked;
              if (s.assist) assisted.current = true;
              paint((n) => n + 1);
            }}
          />
          <div>
            <b>{kind === "dock" ? "Docking" : "Landing"} assistance</b>
            <small>
              Watch a safe approach, or switch off and take over. Manual success
              earns a higher rating.
            </small>
          </div>
        </label>
        {kind === "dock" ? (
          <div className="dock-controls" data-guide="maneuver-controls">
            {[
              { x: -1, y: 0, label: "← Nudge left" },
              { x: 1, y: 0, label: "Nudge right →" },
              { x: 0, y: -1, label: "↑ Move toward port" },
              { x: 0, y: 1, label: "↓ Brake / move away" },
            ].map((a) => (
              <button
                key={a.label}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  thrust(a.x, a.y);
                }}
                onPointerUp={() => (keys.current = { x: 0, y: 0 })}
                onPointerCancel={() => (keys.current = { x: 0, y: 0 })}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    thrust(a.x, a.y);
                  }
                }}
                onKeyUp={() => (keys.current = { x: 0, y: 0 })}
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <label className="throttle-control" data-guide="maneuver-controls">
              LANDING ENGINE <b>{Math.round(s.throttle * 100)}%</b>
              <input
                aria-label="Landing engine throttle"
                type="range"
                min="0"
                max="100"
                value={Math.round(s.throttle * 100)}
                onChange={(ev) => {
                  s.assist = false;
                  s.throttle = +ev.target.value / 100;
                  paint((n) => n + 1);
                }}
              />
            </label>
            <div className="steer-controls">
              <button
                onClick={() => {
                  s.assist = false;
                  s.angle = Math.max(-30, s.angle - 2);
                }}
              >
                ← Tilt
              </button>
              <div>
                <span>ANGLE</span>
                <b>{s.angle.toFixed(0)}°</b>
              </div>
              <button
                onClick={() => {
                  s.assist = false;
                  s.angle = Math.min(30, s.angle + 2);
                }}
              >
                Tilt →
              </button>
            </div>
          </>
        )}
        {kind === "dock" && tier > 0 && (
          <div className="steer-controls">
            <button
              onClick={() => {
                s.assist = false;
                s.angle -= 1;
              }}
            >
              Rotate ↶
            </button>
            <div>
              <span>ALIGNMENT</span>
              <b>{s.angle.toFixed(0)}°</b>
            </div>
            <button
              onClick={() => {
                s.assist = false;
                s.angle += 1;
              }}
            >
              Rotate ↷
            </button>
          </div>
        )}
        <p className="career-tip">
          {kind === "dock"
            ? "Goal: slow contact inside the green port. Higher assignments narrow the tolerances. A/D sideways, W/S forward and brake."
            : `Goal: under ${(3 - tier * 0.5).toFixed(1)} m/s downward, under 2 m/s sideways, within ${35 - tier * 10} m of the pad. W/S throttle, A/D tilt.`}
        </p>
        <button className="secondary" onClick={() => setPaused(!paused)}>
          {paused ? "Resume maneuver" : "Pause maneuver"}
        </button>
        <p className="career-micro">
          {kind === "dock" ? "4×" : "2×"} training time ·{" "}
          {kind === "dock"
            ? "No orbital perturbations"
            : `Gravity ${bodies[world].gravity} m/s²; simplified near-surface descent`}
          . Grades include fuel and contact speed.
        </p>
      </div>
      {guide && (
        <Coach
          steps={[
            {
              title:
                kind === "dock"
                  ? "Docking is a speed problem."
                  : "Landing is a braking problem.",
              body:
                kind === "dock"
                  ? "Your module starts moving toward the station. You must line it up and slow it before contact. If you miss the port or hit too fast, the assignment fails."
                  : "Gravity is already pulling the lander down. Use the engine to slow the fall. Too much speed, sideways drift, an excessive tilt or missing the pad causes a crash.",
            },
            {
              title: "Read the motion before acting.",
              body: "Speed matters as much as position. Fuel is limited. Later assignments reduce fuel and tighten contact tolerances.",
              target: '[data-guide="maneuver-state"]',
            },
            {
              title:
                kind === "dock"
                  ? "Short bursts, then counter-thrust."
                  : "Control thrust and cancel sideways motion.",
              body:
                kind === "dock"
                  ? "A/D moves sideways; W/S approaches and brakes. Letting go does not stop the craft. Push in the opposite direction to cancel drift."
                  : "W/S adjusts engine throttle; A/D tilts the lander. Tilt changes sideways acceleration. Straighten before touchdown, and start braking before you are close to the ground.",
              target: '[data-guide="maneuver-controls"]',
            },
            {
              title: "Take control when you are ready.",
              body: "The walkthrough pauses time but does not operate the craft. Optional assistance is available if you need a demonstration; using it caps the mastery rating. Retry failures or redesign your fuel reserve.",
            },
          ]}
          onClose={() => {
            markSeen(guideKey);
            setGuide(false);
          }}
        />
      )}
    </div>
  );
}
