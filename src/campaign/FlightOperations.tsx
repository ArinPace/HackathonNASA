import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, HelpCircle, Pause, Play } from "lucide-react";
import { Coach, unseen, markSeen, type Lesson } from "./Coach";
import { bodies, type World, type Result } from "./model";
import type { FlightKit } from "./workshop";
import {
  newDeployment,
  deploymentStep,
  deploymentAligned,
  releasePayload,
  newNavigation,
  navigationStep,
  navigationSpec,
  navigationAligned,
  newField,
  fieldStep,
  nearbySite,
  beginSampling,
  atLander,
  fieldGoal,
  fieldSites,
  fieldRocks,
} from "./operations";
import "./operations.css";

function useClock(tick: (dt: number) => void) {
  const live = useRef(tick);
  live.current = tick;
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
function useGuide(key: string) {
  const [guide, setGuide] = useState(() => unseen(key));
  return {
    guide,
    open: () => setGuide(true),
    close: () => {
      markSeen(key);
      setGuide(false);
    },
  };
}
function useFinish(onDone: (r: Result) => void) {
  const reported = useRef(false);
  return (r: Result) => {
    if (!reported.current) {
      reported.current = true;
      onDone(r);
    }
  };
}
type Props = {
  tier: number;
  kit: FlightKit;
  onDone: (r: Result) => void;
  suspended?: boolean;
};
function Shell({
  title,
  stage,
  description,
  visual,
  children,
  help,
  steps,
  paused,
  onPause,
}: {
  title: string;
  stage: string;
  description: string;
  visual: ReactNode;
  children: ReactNode;
  help: ReturnType<typeof useGuide>;
  steps: Lesson[];
  paused: boolean;
  onPause: () => void;
}) {
  return (
    <div className="career-challenge operations-challenge">
      <div className="operations-view">{visual}</div>
      <div className="career-controls operations-controls">
        <div className="challenge-help">
          <span className="eyebrow">{stage}</span>
          <button className="text-button" onClick={help.open}>
            <HelpCircle size={15} /> Walkthrough
          </button>
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
        <button className="text-button operations-pause" onClick={onPause}>
          {paused ? <Play size={14} /> : <Pause size={14} />}{" "}
          {paused ? "Resume operation" : "Pause operation"}
        </button>
        <p className="career-micro">
          Compressed, fictional training exercise. Controls and resources
          determine the outcome; this is not a high-fidelity engineering model.
        </p>
      </div>
      {help.guide && <Coach steps={steps} onClose={help.close} />}
    </div>
  );
}
export function DeploymentChallenge({
  tier,
  kit,
  onDone,
  suspended = false,
}: Props) {
  const state = useRef(newDeployment(tier, kit)),
    [, paint] = useState(0),
    [paused, setPaused] = useState(false);
  const help = useGuide(`deployment-v1-${tier}`),
    finish = useFinish(onDone),
    s = state.current;
  const blocked = help.guide || paused || suspended;
  useClock((dt) => {
    if (blocked) return;
    deploymentStep(s, tier, dt);
    paint((n) => n + 1);
    if (s.status === "failed")
      finish({
        success: false,
        score: 0,
        reason: s.reason,
        stats: [
          { label: "Payload release", value: "Unsafe" },
          { label: "Spin rate", value: `${s.rate.toFixed(1)}°/s` },
        ],
      });
  });
  useEffect(() => {
    s.torque = 0;
    const down = (e: KeyboardEvent) => {
      if (
        blocked ||
        !s.started ||
        s.status !== "active" ||
        /INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName)
      )
        return;
      if (["a", "ArrowLeft", "d", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        s.torque = ["a", "ArrowLeft"].includes(e.key) ? -1 : 1;
      }
    };
    const up = () => {
      s.torque = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", up);
    return () => {
      up();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", up);
    };
  }, [blocked]);
  const aligned = deploymentAligned(s, tier);
  return (
    <Shell
      title="Release it. Keep it steady."
      stage="FLIGHT STAGE · PAYLOAD COMMISSIONING"
      description="The payload is rotating after launch. Remove its protective shell, cancel the spin, point the nose into the green zone, then release it. Releasing while spinning can lose the spacecraft."
      help={help}
      paused={paused}
      onPause={() => setPaused(!paused)}
      steps={[
        {
          title: "Launch is only the beginning.",
          body: "The protective fairing must open before your spacecraft can separate. Start commissioning when you are ready; the clock waits until then.",
        },
        {
          title: "Rotation has momentum.",
          body: "Hold A or D, or a torque button, to change spin rate. Releasing the control stops the push, not the spin. Push the opposite way to brake. Use the slider for fine corrections.",
          target: '[data-guide="attitude-controls"]',
        },
        {
          title: "Angle and spin must both be safe.",
          body: `Aim within ±${12 - tier * 2}° and reduce spin below ${(1.5 - tier * 0.3).toFixed(1)}°/s. The ring turns green when both are safe. Release is allowed outside that zone, but it will fail.`,
          target: '[data-guide="attitude-readouts"]',
        },
      ]}
      visual={
        <>
          <span className="challenge-sky-label">
            ATTITUDE CONTROL · COUNTER-ROTATION · SEPARATION
          </span>
          <svg
            viewBox="0 0 600 500"
            role="img"
            aria-label="Rotating spacecraft inside an attitude target ring"
          >
            <defs>
              <radialGradient id="attitude-glow">
                <stop stopColor="#183d3d" />
                <stop offset="1" stopColor="#071219" />
              </radialGradient>
            </defs>
            <rect width="600" height="500" fill="url(#attitude-glow)" />
            <circle
              cx="300"
              cy="245"
              r="170"
              fill="none"
              stroke="#344d47"
              strokeDasharray="2 10"
            />
            <path
              d="M267 81 Q300 72 333 81"
              stroke={aligned ? "#c1f18e" : "#86aa72"}
              strokeWidth="12"
              fill="none"
            />
            <text
              x="300"
              y="46"
              textAnchor="middle"
              fill="#b8cfab"
              fontSize="11"
            >
              TARGET ATTITUDE · 0°
            </text>
            <g transform={`translate(300 245) rotate(${s.angle})`}>
              {!s.fairing && (
                <>
                  <rect
                    x="-120"
                    y="-15"
                    width="82"
                    height="46"
                    rx="2"
                    fill="#254b77"
                    stroke="#83aaba"
                  />
                  <rect
                    x="38"
                    y="-15"
                    width="82"
                    height="46"
                    rx="2"
                    fill="#254b77"
                    stroke="#83aaba"
                  />
                </>
              )}
              <rect
                x="-31"
                y="-40"
                width="62"
                height="91"
                rx="7"
                fill={s.released ? "#c7ef8e" : "#b9c3b7"}
              />
              <path d="M-15 -40 L0 -68 L15 -40" fill="#dae9c9" />
              {s.fairing && (
                <path
                  d="M-45 54 L-45 -25 Q-42 -81 0 -107 Q42 -81 45 -25 L45 54 Z"
                  fill="#89999dcc"
                  stroke="#e8ecd6"
                />
              )}
              {s.torque !== 0 && (
                <path
                  className="ops-thruster"
                  d={
                    s.torque < 0
                      ? "M35 -18 L86 -2 L35 0 Z"
                      : "M-35 18 L-86 2 L-35 0 Z"
                  }
                  fill="#98e7ed"
                />
              )}
            </g>
            <text
              x="300"
              y="455"
              textAnchor="middle"
              fill={aligned ? "#c1f18e" : "#e1b98b"}
              fontSize="14"
            >
              {s.released
                ? "PAYLOAD FREE · CONTROL VERIFIED"
                : aligned
                  ? "SAFE RELEASE ATTITUDE"
                  : "BRAKE THE SPIN · ALIGN THE NOSE"}
            </text>
          </svg>
        </>
      }
    >
      <div className="maneuver-stats" data-guide="attitude-readouts">
        <div>
          <span>ANGLE</span>
          <b>{s.angle.toFixed(1)}°</b>
        </div>
        <div>
          <span>SPIN</span>
          <b className={Math.abs(s.rate) > 1.5 - tier * 0.3 ? "danger" : ""}>
            {s.rate.toFixed(1)}°/s
          </b>
        </div>
        <div>
          <span>RCS GAS</span>
          <b>{s.propellant.toFixed(0)}</b>
        </div>
        <div>
          <span>WINDOW</span>
          <b>{Math.max(0, 75 - tier * 10 - s.t).toFixed(0)}s</b>
        </div>
      </div>
      {!s.started ? (
        <button
          className="primary"
          onClick={() => {
            s.started = true;
            paint((n) => n + 1);
          }}
        >
          Start commissioning
        </button>
      ) : (
        <>
          <button
            className="secondary"
            disabled={!s.fairing || s.status !== "active"}
            onClick={() => {
              s.fairing = false;
              paint((n) => n + 1);
            }}
          >
            {s.fairing ? "Jettison protective fairing" : "✓ Fairing separated"}
          </button>
          <div data-guide="attitude-controls">
            <label className="throttle-control">
              REACTION CONTROL TORQUE <b>{s.torque.toFixed(1)}</b>
              <input
                type="range"
                aria-label="Attitude torque"
                min="-1"
                max="1"
                step=".05"
                value={s.torque}
                disabled={s.status !== "active"}
                onChange={(e) => {
                  s.torque = +e.target.value;
                  paint((n) => n + 1);
                }}
              />
            </label>
            <div className="ops-buttons">
              {[-1, 1].map((d) => (
                <button
                  key={d}
                  disabled={s.status !== "active"}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    s.torque = d;
                  }}
                  onPointerUp={() => {
                    s.torque = 0;
                  }}
                  onPointerCancel={() => {
                    s.torque = 0;
                  }}
                >
                  {d < 0 ? "↶ Hold A · brake / left" : "Hold D · right ↷"}
                </button>
              ))}
              <button
                onClick={() => {
                  s.torque = 0;
                  paint((n) => n + 1);
                }}
              >
                Neutral torque
              </button>
            </div>
          </div>
          <p className={"ops-feedback " + (aligned ? "good" : "caution")}>
            {aligned
              ? "Angle and spin are safe. Release after fairing separation."
              : "Release is unsafe. Cancel spin with opposite torque, then align near 0°."}
          </p>
          <button
            className="primary"
            disabled={s.status !== "active"}
            onClick={() => {
              releasePayload(s, tier);
              paint((n) => n + 1);
            }}
          >
            Release payload {aligned && !s.fairing ? "· READY" : "· UNSAFE"}
          </button>
          <button
            className="primary"
            disabled={s.status !== "ready"}
            onClick={() =>
              finish({
                success: true,
                score: Math.min(
                  100,
                  Math.round(
                    80 +
                      (s.propellant / (100 * kit.fuelScale)) * 10 +
                      (1 - s.t / (75 - tier * 10)) * 10,
                  ),
                ),
                reason:
                  "Fairing clear, rotation controlled, payload released safely.",
                stats: [
                  { label: "Commissioning time", value: `${s.t.toFixed(1)} s` },
                  { label: "Release spin", value: `${s.rate.toFixed(2)}°/s` },
                ],
              })
            }
          >
            Continue after deployment <ArrowRight size={16} />
          </button>
        </>
      )}
    </Shell>
  );
}

export function NavigationChallenge({
  world,
  tier,
  kit,
  onDone,
  suspended = false,
}: Props & { world: World }) {
  const state = useRef(newNavigation(world, tier, kit)),
    [, paint] = useState(0),
    [paused, setPaused] = useState(false);
  const help = useGuide(`insertion-v1-${world}-${tier}`),
    finish = useFinish(onDone),
    s = state.current,
    p = navigationSpec(world, tier, kit);
  const blocked = help.guide || paused || suspended;
  useClock((dt) => {
    if (blocked) return;
    navigationStep(s, world, tier, kit, dt);
    paint((n) => n + 1);
    if (s.status === "failed")
      finish({
        success: false,
        score: 0,
        reason: s.reason,
        stats: [
          {
            label: "Useful burn",
            value: `${s.dv.toFixed(0)} / ${p.required} m/s`,
          },
          {
            label: "Propellant budget left",
            value: `${s.fuel.toFixed(0)} m/s`,
          },
        ],
      });
  });
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        blocked ||
        !s.started ||
        s.status !== "active" ||
        /INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName)
      )
        return;
      if (e.key === "a" || e.key === "d") {
        e.preventDefault();
        s.heading = (s.heading + (e.key === "a" ? -5 : 5) + 360) % 360;
      }
      if (
        e.code === "Space" &&
        (e.target as HTMLElement).tagName !== "BUTTON"
      ) {
        e.preventDefault();
        s.burning = !s.burning;
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [blocked]);
  const inWindow = s.t >= p.opens && s.t <= p.closes,
    progress = s.dv / p.required,
    aligned = navigationAligned(s, world, tier, kit),
    orbitAngle = (s.t / p.closes) * Math.PI * 1.2 + 3.8;
  const periapsis = -50 + (p.altitude + 50) * progress;
  const gateStart = (p.opens / p.closes) * Math.PI * 1.2 + 3.8;
  const gateEnd = Math.PI * 1.2 + 3.8;
  return (
    <Shell
      title="Burn for a stable orbit."
      stage="FLIGHT STAGE · MANUAL INSERTION"
      description="Orbit needs sideways speed. Point the engine prograde (90°), wait for the green burn window, ignite, then cut the engine in the target band. Too little burn leaves an unsafe low point; too much overshoots."
      help={help}
      paused={paused}
      onPause={() => setPaused(!paused)}
      steps={[
        {
          title: "You control this arrival.",
          body: "The travel service delivered you to an approach. This compressed exercise makes you supply the final speed change. Set direction before starting the clock.",
        },
        {
          title: "Point along the direction of travel.",
          body: "90° is prograde. 0° is radial and wastes this burn; 270° is retrograde and reduces the speed change. Set heading and throttle.",
          target: '[data-guide="insertion-heading"]',
        },
        {
          title: "Timing and cutoff both matter.",
          body: `The burn window opens at ${p.opens} seconds and closes at ${p.closes}. Ignite inside it and cut thrust near ${p.required} m/s. A lower throttle gives finer control but needs more time. Confirm only after the engine is off.`,
          target: '[data-guide="insertion-burn"]',
        },
      ]}
      visual={
        <>
          <span className="challenge-sky-label">
            {bodies[world].name.toUpperCase()} · ORBIT INSERTION · SCHEMATIC
          </span>
          <svg
            viewBox="0 0 600 500"
            role="img"
            aria-label="Target circular orbit and current insertion trajectory"
          >
            <circle cx="300" cy="250" r="66" fill={bodies[world].color} />
            <ellipse
              cx="300"
              cy="250"
              rx="185"
              ry="150"
              fill="none"
              stroke="#b4d88e"
              strokeDasharray="5 6"
            />
            <ellipse
              cx={300 - 150 * Math.max(0, 1 - progress)}
              cy="250"
              rx="185"
              ry={80 + Math.max(0, Math.min(1.3, progress)) * 70}
              fill="none"
              stroke={aligned ? "#ccf595" : "#dfa76c"}
              strokeWidth="3"
            />
            <path
              d={`M${300 + 185 * Math.cos(gateStart)} ${250 + 150 * Math.sin(gateStart)} A185 150 0 0 1 ${300 + 185 * Math.cos(gateEnd)} ${250 + 150 * Math.sin(gateEnd)}`}
              fill="none"
              stroke={inWindow ? "#b9ee8a" : "#39564b"}
              strokeWidth="14"
            />
            <g
              transform={`translate(${300 + 185 * Math.cos(orbitAngle)} ${250 + 150 * Math.sin(orbitAngle)}) rotate(${(orbitAngle * 180) / Math.PI + 90 + s.heading})`}
            >
              <path d="M0 -20 L13 16 L0 10 L-13 16Z" fill="#e2ecd2" />
              {s.burning && (
                <path
                  className="ops-thruster"
                  d="M-7 18 L0 60 L7 18"
                  fill="#78d4ee"
                />
              )}
            </g>
            <text
              x="300"
              y="55"
              textAnchor="middle"
              fill="#c9dfb5"
              fontSize="14"
            >
              TARGET LOW POINT · {p.altitude} km
            </text>
            <text
              x="300"
              y="460"
              textAnchor="middle"
              fill={aligned ? "#c1f18e" : "#d5b088"}
              fontSize="14"
            >
              {s.status === "ready"
                ? "ORBIT CONTRACT SECURED"
                : `LOW POINT ESTIMATE · ${periapsis.toFixed(0)} km`}
            </text>
          </svg>
        </>
      }
    >
      <div className="maneuver-stats">
        <div>
          <span>USEFUL ΔV</span>
          <b>{s.dv.toFixed(0)} m/s</b>
        </div>
        <div>
          <span>TARGET</span>
          <b>{p.required} m/s</b>
        </div>
        <div>
          <span>RESERVE</span>
          <b>{s.fuel.toFixed(0)} m/s</b>
        </div>
        <div>
          <span>APPROACH</span>
          <b>{s.t.toFixed(1)}s</b>
        </div>
      </div>
      <label className="throttle-control" data-guide="insertion-heading">
        ENGINE HEADING · TARGET 90° <b>{s.heading}°</b>
        <input
          type="range"
          min="0"
          max="360"
          aria-label="Insertion heading"
          value={s.heading}
          disabled={s.status !== "active"}
          onChange={(e) => {
            s.heading = +e.target.value;
            paint((n) => n + 1);
          }}
        />
      </label>
      <label className="throttle-control">
        BURN THROTTLE <b>{Math.round(s.throttle * 100)}%</b>
        <input
          type="range"
          min="0"
          max="100"
          aria-label="Insertion throttle"
          value={Math.round(s.throttle * 100)}
          disabled={s.status !== "active"}
          onChange={(e) => {
            s.throttle = +e.target.value / 100;
            paint((n) => n + 1);
          }}
        />
      </label>
      <div data-guide="insertion-burn">
        <p className={"ops-feedback " + (inWindow ? "good" : "caution")}>
          {!s.started
            ? "Set your heading before you start the clock."
            : s.t < p.opens
              ? `COAST · burn window opens in ${(p.opens - s.t).toFixed(1)}s`
              : `BURN WINDOW · ${(p.closes - s.t).toFixed(1)}s remaining`}
        </p>
        <div className="burn-target">
          <span
            style={{
              left: `${((1 - p.tolerance) / 1.35) * 100}%`,
              width: `${((p.tolerance * 2) / 1.35) * 100}%`,
            }}
          />
          <i
            style={{
              left: `${Math.max(0, Math.min(100, (progress / 1.35) * 100))}%`,
            }}
          />
        </div>
        {!s.started ? (
          <button
            className="primary"
            onClick={() => {
              s.started = true;
              paint((n) => n + 1);
            }}
          >
            Begin insertion approach
          </button>
        ) : (
          <button
            className={"primary " + (s.burning ? "engine-cutoff" : "")}
            disabled={s.status !== "active"}
            onClick={() => {
              s.burning = !s.burning;
              paint((n) => n + 1);
            }}
          >
            {s.burning ? "Cut insertion engine" : "Ignite insertion engine"}
          </button>
        )}
      </div>
      <button
        className="primary"
        disabled={s.status !== "ready"}
        onClick={() =>
          finish({
            success: true,
            score: Math.round(
              85 +
                Math.max(0, 1 - Math.abs(progress - 1) / p.tolerance) * 10 +
                (s.fuel / p.capacity) * 5,
            ),
            reason:
              "The arrival burn secured the selected orbit within the timing and propellant contract.",
            stats: [
              {
                label: "Insertion error",
                value: `${(Math.abs(progress - 1) * 100).toFixed(1)}%`,
              },
              { label: "Insertion reserve", value: `${s.fuel.toFixed(0)} m/s` },
            ],
          })
        }
      >
        Confirm stable orbit <ArrowRight size={16} />
      </button>
      <p className="career-micro">
        The low-point estimate interpolates a target, rather than solving
        Keplerian motion. Δv, time window and propellant are transparent game
        contracts.
      </p>
    </Shell>
  );
}

export function SurfaceChallenge({
  world,
  tier,
  kit,
  onDone,
  suspended = false,
}: Props & { world: World }) {
  const state = useRef(newField()),
    input = useRef({ x: 0, y: 0 }),
    [, paint] = useState(0),
    [paused, setPaused] = useState(false);
  const help = useGuide(`field-v1-${world}-${tier}`),
    finish = useFinish(onDone),
    s = state.current,
    blocked = help.guide || paused || suspended;
  useClock((dt) => {
    if (blocked) return;
    fieldStep(s, tier, kit, dt, input.current);
    paint((n) => n + 1);
    if (s.status === "failed")
      finish({
        success: false,
        score: 0,
        reason: s.reason,
        stats: [
          { label: "Unique samples collected", value: `${s.samples.length}` },
          {
            label: "Samples received",
            value: `${Math.floor(s.received)}/${fieldGoal(tier)}`,
          },
        ],
      });
  });
  useEffect(() => {
    input.current = { x: 0, y: 0 };
    const pressed = new Set<string>();
    const update = () => {
      input.current = {
        x: +pressed.has("d") - +pressed.has("a"),
        y: +pressed.has("s") - +pressed.has("w"),
      };
    };
    const down = (e: KeyboardEvent) => {
      if (
        blocked ||
        !s.started ||
        s.status !== "active" ||
        /INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName)
      )
        return;
      const key =
        (
          {
            ArrowLeft: "a",
            ArrowRight: "d",
            ArrowUp: "w",
            ArrowDown: "s",
          } as Record<string, string>
        )[e.key] ?? e.key.toLowerCase();
      if ("wasd".includes(key) && key.length === 1) {
        e.preventDefault();
        pressed.add(key);
        update();
      }
    };
    const up = (e: KeyboardEvent) => {
      const key =
        (
          {
            ArrowLeft: "a",
            ArrowRight: "d",
            ArrowUp: "w",
            ArrowDown: "s",
          } as Record<string, string>
        )[e.key] ?? e.key.toLowerCase();
      pressed.delete(key);
      update();
    };
    const blur = () => {
      pressed.clear();
      update();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      blur();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [blocked]);
  const site = nearbySite(s),
    sampled = site >= 0 && s.samples.includes(site),
    shadow = s.x > 350 && s.y < 190;
  return (
    <Shell
      title="Touchdown was the start."
      stage="SURFACE STAGE · ROVER SCIENCE & RECOVERY"
      description={`Drive to ${fieldGoal(tier)} different outcrops, stop to sample, then return to the lander and send the evidence. Steer around the boulder fields. Stop in sunlight to recharge before the battery empties.`}
      help={help}
      paused={paused}
      onPause={() => setPaused(!paused)}
      steps={[
        {
          title: "Turn a landing into useful science.",
          body: `You need ${fieldGoal(tier)} unique samples. Each numbered outcrop contains one. Start the rover when ready. Landing alone does not finish this mission.`,
        },
        {
          title: "Drive, stop, sample.",
          body: "Use WASD/arrow keys or hold the drive buttons. Stop near an outcrop, then start the drill. Moving cancels drilling. Marked rocks damage the rover if you drive through them.",
          target: '[data-guide="rover-controls"]',
        },
        {
          title: "The return trip matters.",
          body: "Recharge while parked in sunlight; the dark region blocks solar charging. Bring samples back to the lander and start downlink. Only evidence received counts toward the objective.",
          target: '[data-guide="rover-actions"]',
        },
      ]}
      visual={
        <>
          <span className="challenge-sky-label">
            {bodies[world].name.toUpperCase()} SURFACE · LOCAL TRAINING MAP ·
            WASD TO DRIVE
          </span>
          <svg
            viewBox="0 0 600 440"
            role="img"
            aria-label="Driveable rover, four scientific outcrops, boulder hazards and home lander"
          >
            <rect
              width="600"
              height="440"
              fill={world === "mars" ? "#603e30" : "#303b3c"}
            />
            <path d="M350 0H600V190H350Z" fill="#07131888" />
            <text
              x="458"
              y="45"
              textAnchor="middle"
              fill="#98a7a4"
              fontSize="10"
            >
              SHADOW · NO SOLAR CHARGE
            </text>
            {Array.from({ length: 12 }, (_, i) => (
              <ellipse
                key={i}
                cx={(i * 127 + 40) % 590}
                cy={(i * 83 + 20) % 430}
                rx="23"
                ry="11"
                fill="#17242333"
                stroke="#c1b79722"
              />
            ))}
            {fieldRocks.map((r, i) => (
              <g key={i}>
                <circle
                  cx={r.x}
                  cy={r.y}
                  r={r.r}
                  fill="#252c2d"
                  stroke="#dc936c"
                  strokeDasharray="4 3"
                />
                <path
                  d={`M${r.x - 20} ${r.y + 9}l13 -27 22 7 10 25Z`}
                  fill="#898278"
                />
              </g>
            ))}
            <circle
              cx="60"
              cy="225"
              r="48"
              fill="#c3eb7f13"
              stroke="#c3eb7f66"
              strokeDasharray="4 5"
            />
            <path
              d="M42 242L50 212H70L78 242M48 224H72"
              fill="none"
              stroke="#d5e5bf"
              strokeWidth="4"
            />
            <text
              x="60"
              y="288"
              textAnchor="middle"
              fill="#d5e5bf"
              fontSize="10"
            >
              LANDER / DOWNLINK
            </text>
            {fieldSites.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="24"
                  fill={s.samples.includes(i) ? "#b7e88744" : "#b5c79217"}
                  stroke={s.samples.includes(i) ? "#c2f18b" : "#e5c091"}
                />
                <text
                  x={p.x}
                  y={p.y + 5}
                  textAnchor="middle"
                  fill="#ecedce"
                  fontSize="15"
                >
                  {s.samples.includes(i) ? "✓" : i + 1}
                </text>
                <text
                  x={p.x}
                  y={p.y + 40}
                  textAnchor="middle"
                  fill="#c8cbb9"
                  fontSize="9"
                >
                  {p.name}
                </text>
              </g>
            ))}
            <g transform={`translate(${s.x} ${s.y})`}>
              <rect
                x="-12"
                y="-8"
                width="24"
                height="16"
                rx="3"
                fill="#d0e6af"
                stroke="#122824"
              />
              {[-9, 9].map((x) => (
                <g key={x}>
                  <rect x={x - 3} y="-13" width="6" height="6" fill="#141e22" />
                  <rect x={x - 3} y="7" width="6" height="6" fill="#141e22" />
                </g>
              ))}
              <circle r="4" fill="#356374" />
            </g>
            {s.mode === "send" && atLander(s) && (
              <path
                className="rover-uplink"
                d="M60 210Q95 155 130 195M60 210Q115 110 175 172"
                fill="none"
                stroke="#d5f2a0"
                strokeWidth="2"
              />
            )}
          </svg>
        </>
      }
    >
      <div className="maneuver-stats">
        <div>
          <span>BATTERY</span>
          <b
            data-guide="rover-battery"
            className={s.battery < 20 ? "danger" : ""}
          >
            {Math.ceil(s.battery)}%
          </b>
        </div>
        <div>
          <span>HEALTH</span>
          <b>{Math.ceil(s.health)}%</b>
        </div>
        <div>
          <span>COLLECTED</span>
          <b>
            {s.samples.length}/{fieldGoal(tier)}
          </b>
        </div>
        <div>
          <span>WINDOW</span>
          <b>{Math.max(0, 150 - tier * 20 - s.t).toFixed(0)}s</b>
        </div>
      </div>
      <p className="ops-coordinates">
        LOCAL POSITION{" "}
        <b data-guide="rover-position">
          {s.x.toFixed(1)}, {s.y.toFixed(1)} m
        </b>{" "}
        · LANDER {Math.hypot(s.x - 60, s.y - 225).toFixed(0)} m away
      </p>
      {!s.started ? (
        <button
          className="primary"
          onClick={() => {
            s.started = true;
            paint((n) => n + 1);
          }}
        >
          Start surface expedition
        </button>
      ) : (
        <>
          <div className="rover-pad" data-guide="rover-controls">
            {[
              { x: 0, y: -1, label: "Drive north" },
              { x: -1, y: 0, label: "Drive west" },
              { x: 0, y: 1, label: "Drive south" },
              { x: 1, y: 0, label: "Drive east" },
            ].map((d) => (
              <button
                key={d.label}
                aria-label={d.label}
                disabled={s.status !== "active"}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  input.current = { x: d.x, y: d.y };
                }}
                onPointerUp={() => {
                  input.current = { x: 0, y: 0 };
                }}
                onPointerCancel={() => {
                  input.current = { x: 0, y: 0 };
                }}
              >
                {d.y < 0 ? "↑ W" : d.x < 0 ? "← A" : d.y > 0 ? "↓ S" : "D →"}
              </button>
            ))}
          </div>
          <p className={"ops-feedback " + (shadow ? "caution" : "good")}>
            {s.status === "ready"
              ? "Surface evidence received. Expedition complete."
              : s.mode === "sample"
                ? `Drilling ${fieldSites[s.site].name}: ${((s.work / (3 + tier * 0.5)) * 100).toFixed(0)}%`
                : site >= 0
                  ? `${fieldSites[site].name} · ${sampled ? "already collected" : "stop here to collect"}`
                  : atLander(s)
                    ? "At the lander. Recharge or downlink collected samples."
                    : shadow
                      ? "In shadow: drive toward sunlight to recharge."
                      : "Sunlit terrain. Park and recharge when needed."}
          </p>
          <div data-guide="rover-actions" className="ops-actions">
            <button
              className="secondary"
              disabled={site < 0 || sampled || s.status !== "active"}
              onClick={() => {
                input.current = { x: 0, y: 0 };
                beginSampling(s);
                paint((n) => n + 1);
              }}
            >
              Collect geological sample
            </button>
            <button
              className="secondary"
              disabled={s.status !== "active"}
              onClick={() => {
                input.current = { x: 0, y: 0 };
                s.mode = "charge";
                paint((n) => n + 1);
              }}
            >
              {shadow
                ? "Recharge · blocked by shadow"
                : "Park & recharge in sunlight"}
            </button>
            <button
              className="primary"
              disabled={
                !atLander(s) || !s.samples.length || s.status !== "active"
              }
              onClick={() => {
                s.mode = "send";
                paint((n) => n + 1);
              }}
            >
              Send surface evidence
            </button>
          </div>
          <div className="career-meter">
            <span>
              EVIDENCE RECEIVED{" "}
              <b>
                {Math.min(fieldGoal(tier), s.received).toFixed(1)} /{" "}
                {fieldGoal(tier)}
              </b>
            </span>
            <i>
              <em
                style={{ width: `${(s.received / fieldGoal(tier)) * 100}%` }}
              />
            </i>
          </div>
          <button
            className="primary"
            disabled={s.status !== "ready"}
            onClick={() =>
              finish({
                success: true,
                score: Math.min(
                  100,
                  Math.round(70 + s.battery * 0.15 + s.health * 0.15),
                ),
                reason:
                  "The rover collected unique geological samples and returned their evidence through the lander.",
                stats: [
                  {
                    label: "Surface evidence returned",
                    value: `${Math.floor(s.received)} unique sites`,
                  },
                  {
                    label: "Rover battery / health",
                    value: `${Math.ceil(s.battery)}% / ${Math.ceil(s.health)}%`,
                  },
                ],
              })
            }
          >
            Complete surface expedition <ArrowRight size={16} />
          </button>
        </>
      )}
    </Shell>
  );
}
