import { useEffect, useRef, useState } from "react";
import {
  Rocket,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
} from "lucide-react";
import {
  newLaunch,
  launchStep,
  separate,
  type RocketConfig,
} from "./sim/launch";
import { LaunchScene } from "./LaunchScene";
import { vehicle, type Design } from "./sim/mission";
import { Coach, unseen, markSeen } from "./campaign/Coach";
export function LaunchScreen({
  design,
  reduced,
  muted,
  paused,
  onMute,
  onComplete,
  destination = "moon",
  rocketConfig,
  payloadKg,
  assistInitially = true,
}: {
  design: Design;
  reduced: boolean;
  muted: boolean;
  paused: boolean;
  onMute: () => void;
  onComplete: () => void;
  destination?: "earth" | "moon" | "mars";
  rocketConfig?: Partial<RocketConfig>;
  payloadKg?: number;
  assistInitially?: boolean;
}) {
  const destinationName =
    destination === "earth"
      ? "Earth orbit"
      : destination === "mars"
        ? "Mars"
        : "the Moon";
  const [guide, setGuide] = useState(() => unseen("launch-v4"));
  const state = useRef({ ...newLaunch(rocketConfig), assist: assistInitially }),
    [, render] = useState(0),
    [hold, setHold] = useState(false),
    [travel, setTravel] = useState<number | null>(null),
    [tip, setTip] = useState("");
  const audio = useRef<AudioContext | null>(null),
    rumble = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const muteRef = useRef(muted);
  muteRef.current = muted;
  useEffect(() => {
    let id = 0,
      last = 0,
      paint = 0;
    function frame(now: number) {
      id = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      if (!paused && !hold && !guide && travel === null)
        launchStep(state.current, dt, payloadKg ?? vehicle(design).mass);
      if (rumble.current) {
        const firing =
          !paused &&
          !hold &&
          !guide &&
          travel === null &&
          state.current.status === "flying" &&
          state.current.fuel[state.current.stage - 1] > 0;
        rumble.current.gain.gain.setTargetAtTime(
          firing && !muteRef.current ? 0.035 : 0,
          audio.current!.currentTime,
          0.1,
        );
      }
      if (now - paint > 80) {
        render((n) => n + 1);
        paint = now;
      }
    }
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [paused, hold, guide, travel === null, design, payloadKg]);
  useEffect(() => {
    if (travel === null || paused || hold || guide) return;
    const id = setInterval(
      () => setTravel((p) => (p === null ? null : Math.min(1, p + 0.025))),
      150,
    );
    return () => clearInterval(id);
  }, [travel === null, paused, hold, guide]);
  useEffect(
    () => () => {
      rumble.current?.osc.stop();
      void audio.current?.close();
    },
    [],
  );
  function ignite() {
    const s = state.current;
    if (s.status !== "ready") return;
    s.status = "countdown";
    try {
      rumble.current?.osc.stop();
      void audio.current?.close();
      const ctx = new AudioContext();
      audio.current = ctx;
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 36;
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      rumble.current = { osc, gain };
    } catch {}
    render((n) => n + 1);
  }
  function stage() {
    if (separate(state.current)) {
      setTip(
        "Booster separated! The upper engine is now pushing your explorer toward space.",
      );
    } else
      setTip(
        "Wait until booster fuel is below 5%. Dropping it now would waste usable fuel.",
      );
    render((n) => n + 1);
  }
  function steer(delta: number) {
    state.current.assist = false;
    state.current.pitch = Math.max(
      -65,
      Math.min(65, state.current.pitch + delta),
    );
    render((n) => n + 1);
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (guide || paused) return;
      if (
        ["INPUT", "SELECT", "TEXTAREA"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      if (
        e.code === "Space" &&
        (e.target as HTMLElement).tagName !== "BUTTON"
      ) {
        e.preventDefault();
        stage();
      }
      if (e.key === "a" || e.key === "ArrowLeft") {
        e.preventDefault();
        steer(-3);
      }
      if (e.key === "d" || e.key === "ArrowRight") {
        e.preventDefault();
        steer(3);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [guide, paused]);
  const s = state.current,
    stageReady =
      s.status === "flying" &&
      s.stage === 1 &&
      s.fuel[0] <= s.config.firstFuel * 0.05;
  const subtitle =
    s.status === "ready"
      ? "Your explorer is inside the tip of this rocket. Let’s get it off Earth."
      : s.status === "countdown"
        ? "Engine checks complete. Stand by for liftoff."
        : s.status === "failed"
          ? "The climb did not work. Try again with flight assistance, or more thrust."
          : s.status === "handoff"
            ? "You reached the edge of space. Next: the guided journey to your destination."
            : stageReady
              ? "The booster is nearly empty. Separate it to drop dead weight and start the next engine."
              : s.stage === 2
                ? "Upper engine firing. Your rocket is lighter now—watch it climb."
                : "The engine pushes up; Earth’s gravity pulls down. Keep enough thrust to climb.";
  return (
    <section className="launch-screen" aria-label="Rocket launch">
      <div className="launch-theater">
        {travel === null ? (
          <>
            <LaunchScene
              state={s}
              heavy={design.launcher === "heavy"}
              reduced={reduced}
            />
            <div className="launch-scene-title">
              <span className="eyebrow">EARTH · LAUNCH COMPLEX 01</span>
              <h1>
                {s.status === "ready"
                  ? "Your ride to space."
                  : s.status === "countdown"
                    ? "All eyes on the sky."
                    : s.status === "handoff"
                      ? "Hello, space."
                      : s.status === "failed"
                        ? "Every flight teaches."
                        : "We have liftoff."}
              </h1>
              <span className="launch-phase">
                {s.status === "flying"
                  ? `T+${Math.floor(s.time)}s · ${s.stage === 1 ? "BOOSTER" : "UPPER ENGINE"}`
                  : destinationName.toUpperCase() +
                    " · " +
                    s.status.toUpperCase()}
              </span>
            </div>
            {s.status === "countdown" && (
              <div className="countdown-number" aria-live="assertive">
                {Math.ceil(s.countdown)}
              </div>
            )}
            <div className="launch-instruments">
              <div>
                <span>HEIGHT ABOVE EARTH</span>
                <b>
                  {(s.altitude / 1000).toFixed(1)}
                  <small> km</small>
                </b>
              </div>
              <div>
                <span>CLIMB SPEED</span>
                <b>
                  {Math.round(s.velocity)}
                  <small> m/s</small>
                </b>
              </div>
              <div>
                <span>ROCKET STAGE</span>
                <b>
                  {s.stage}
                  <small> / 2</small>
                </b>
              </div>
            </div>
          </>
        ) : (
          <div className="transfer-scene">
            <span className="eyebrow">
              {destination === "earth"
                ? "GUIDED ORBIT INSERTION · TIME COMPRESSED"
                : destination === "mars"
                  ? "GUIDED TRANSFER · MONTHS COMPRESSED"
                  : "GUIDED TRANSFER · THREE DAYS COMPRESSED"}
            </span>
            <h1>
              Next stop.
              <br />
              <em>{destinationName}.</em>
            </h1>
            <div className="transfer-path">
              <div className="transfer-earth">
                🌍<span>EARTH</span>
              </div>
              <div className="transfer-track">
                <i style={{ width: `${travel * 100}%` }} />
                <Rocket
                  className="transfer-ship"
                  style={{ left: `${travel * 90}%` }}
                />
              </div>
              <div className="transfer-moon">
                {destination === "earth"
                  ? "🌍"
                  : destination === "mars"
                    ? "🔴"
                    : "🌕"}
                <span>
                  {destination === "earth"
                    ? "EARTH ORBIT"
                    : destination === "mars"
                      ? "MARS"
                      : "MOON"}
                </span>
              </div>
            </div>
            <div className="transfer-chapters">
              <span className={travel > 0.1 ? "done" : ""}>01 LEAVE EARTH</span>
              <span className={travel > 0.45 ? "done" : ""}>02 CRUISE</span>
              <span className={travel > 0.85 ? "done" : ""}>
                03 ENTER ORBIT
              </span>
            </div>
            <p>
              {travel < 0.3
                ? "The launch service supplies the speed and direction for this part of the journey."
                : travel < 0.8
                  ? "Your robot coasts through space. A rocket does not need to keep firing all the way."
                  : "Arrival burn: the service adjusts your explorer’s speed so it enters the selected orbit."}
            </p>
            <small>
              Illustrative travel sequence. Orbital insertion and destination
              transfer are guided, not calculated by the ascent mini-game.
            </small>
          </div>
        )}
      </div>
      <aside className="launch-panel">
        <button className="text-button" onClick={() => setGuide(true)}>
          <HelpCircle size={17} /> Walkthrough
        </button>
        <span className="eyebrow">
          {travel === null ? "YOU ARE LAUNCH DIRECTOR" : "ARRIVAL BRIEFING"}
        </span>
        <h2>
          {travel === null
            ? "Let’s launch your explorer."
            : "Now you are mission control."}
        </h2>
        <p className="launch-explanation">
          {travel === null
            ? subtitle
            : `The rocket’s job is done. Your explorer is now at ${destinationName}. Follow this assignment’s objectives to earn the next unlock.`}
        </p>
        {travel === null ? (
          <>
            <div className="launch-lesson">
              <Rocket size={20} />
              <div>
                <b>Why does a rocket have stages?</b>
                <p>
                  Fuel tanks become useless weight when empty. Dropping an empty
                  section lets the next engine push a much lighter spacecraft.
                </p>
              </div>
            </div>
            <label className="assist-toggle">
              <input
                type="checkbox"
                checked={s.assist}
                onChange={(e) => {
                  s.assist = e.target.checked;
                  render((n) => n + 1);
                }}
              />
              <div>
                <b>Flight assistance</b>
                <small>
                  Recommended first flight. Holds a safe throttle and direction;
                  waits for you to separate the booster.
                </small>
              </div>
            </label>
            <div className="launch-fuel">
              <div>
                <span>
                  {s.stage === 1 ? "BOOSTER FUEL" : "UPPER-STAGE FUEL"}
                </span>
                <b>
                  {Math.round(
                    (s.fuel[s.stage - 1] /
                      (s.stage === 1
                        ? s.config.firstFuel
                        : s.config.upperFuel)) *
                      100,
                  )}
                  %
                </b>
              </div>
              <div className="bar">
                <i
                  style={{
                    width: `${(s.fuel[s.stage - 1] / (s.stage === 1 ? s.config.firstFuel : s.config.upperFuel)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <label className="throttle-control">
              ENGINE THROTTLE <b>{Math.round(s.throttle * 100)}%</b>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(s.throttle * 100)}
                aria-label="Engine throttle"
                onChange={(e) => {
                  s.assist = false;
                  s.throttle = +e.target.value / 100;
                  render((n) => n + 1);
                }}
              />
              <small>
                More throttle = more push and faster fuel use. Moving this
                slider takes manual control.
              </small>
            </label>
            <div className="steer-controls">
              <button onClick={() => steer(-3)} aria-label="Steer left">
                ← A
              </button>
              <div>
                <span>LEAN ANGLE</span>
                <b>{Math.round(s.pitch)}°</b>
              </div>
              <button onClick={() => steer(3)} aria-label="Steer right">
                D →
              </button>
            </div>
            {s.status === "ready" ? (
              <button className="primary ignite" onClick={ignite}>
                Start countdown <Rocket size={18} />
              </button>
            ) : s.status === "failed" ? (
              <button
                className="primary"
                onClick={() => {
                  state.current = {
                    ...newLaunch(rocketConfig),
                    assist: assistInitially,
                  };
                  setTip("");
                }}
              >
                Retry launch <RotateCcw size={17} />
              </button>
            ) : s.status === "handoff" ? (
              <button className="primary" onClick={() => setTravel(0)}>
                {destination === "moon"
                  ? "Set course for the Moon"
                  : `Set course for ${destinationName}`}{" "}
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                className={
                  "primary separate " + (stageReady ? "stage-ready" : "")
                }
                disabled={!stageReady}
                onClick={stage}
              >
                {s.stage === 2 ? "✓ Booster separated" : "Separate booster"}
                <span>SPACE</span>
              </button>
            )}
            {stageReady && (
              <p className="stage-alert" role="status">
                STAGE READY · Press Space or the button above.
              </p>
            )}
            {tip && (
              <p className="launch-tip" role="status">
                {tip}
              </p>
            )}
            <div className="launch-tools">
              <button onClick={() => setHold(!hold)}>
                {hold ? <Play size={14} /> : <Pause size={14} />}{" "}
                {hold ? "Resume" : "Pause"}
              </button>
              <button onClick={onMute}>
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}{" "}
                {muted ? "Enable engine sound" : "Mute engine sound"}
              </button>
            </div>
            <p className="launch-model-note">
              Simplified vertical ascent · 4× compressed flight time · 100 km is
              the edge of space, not orbit. The launch service performs the
              later insertion and transfer.
            </p>
          </>
        ) : (
          <>
            <div className="arrival-controls">
              <div>
                <span>1</span>
                <section>
                  <b>
                    {destination === "earth"
                      ? "Power up your satellite"
                      : destination === "mars"
                        ? "Explore Mars"
                        : "Look at the Moon"}
                  </b>
                  <p>
                    {destination === "earth"
                      ? "Deploy the solar wings, establish a radio link and follow your assignment’s goals."
                      : "Observe means point the sensors down and collect discoveries."}
                  </p>
                </section>
              </div>
              <div>
                <span>2</span>
                <section>
                  <b>Send them home</b>
                  <p>
                    Downlink means point the antenna toward Earth and transmit.
                  </p>
                </section>
              </div>
              <div>
                <span>3</span>
                <section>
                  <b>Refill the battery</b>
                  <p>Charge means turn the solar panels toward sunlight.</p>
                </section>
              </div>
            </div>
            <button
              className="primary"
              disabled={travel < 1}
              onClick={onComplete}
            >
              {travel < 1 ? "Travelling…" : "Deploy explorer & take control"}
              <ArrowRight size={17} />
            </button>
            <p className="launch-model-note">
              The guided first mission pauses at your first observation window.
              You will not have to guess what to do.
            </p>
          </>
        )}
      </aside>
      {guide && (
        <Coach
          steps={[
            {
              title: "Your selected rocket is real game hardware.",
              body: "Booster thrust, propellant quantity, upper-stage engine and spacecraft mass come from the workshop. They affect this ascent.",
            },
            {
              title: "Throttle is engine power.",
              body: "Too little thrust can leave the rocket on the pad or make it fall. More thrust uses fuel faster. Steering too far from upright wastes vertical lift.",
              target: ".throttle-control",
            },
            {
              title: "Separate when the booster is nearly empty.",
              body: "Press Space or Separate booster when it becomes available. In manual flight, the simulation does not wait for you. Ignoring staging or cutting power can lose the rocket.",
              target: ".launch-fuel",
            },
            {
              title: "Practice is available, not automatic.",
              body: "Flight assistance can demonstrate a safe climb, but career launches start under your control. Begin the countdown when you are ready. Reaching 100 km is not orbit; the selected service guides insertion and transfer.",
              target: ".ignite",
            },
          ]}
          onClose={() => {
            markSeen("launch-v4");
            setGuide(false);
          }}
        />
      )}
    </section>
  );
}
