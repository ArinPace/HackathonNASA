import { useRef, useState } from "react";
import {
  ArrowRight,
  AlertTriangle,
  Check,
  Rocket,
  Satellite,
  HelpCircle,
} from "lucide-react";
import { Scene } from "../Scene";
import { LaunchScene } from "../LaunchScene";
import { newLaunch } from "../sim/launch";
import { createState, balancedDesign, type Design } from "../sim/mission";
import { assignments } from "./model";
import { deriveBuild, buildChoices, type Build } from "./workshop";
import { Coach, unseen, markSeen } from "./Coach";
export function Workshop({
  index,
  build,
  onChange,
  onCommit,
  certificate,
}: {
  index: number;
  build: Build;
  onChange: (b: Build) => void;
  onCommit: (skip: boolean) => void;
  certificate: boolean;
}) {
  const [tab, setTab] = useState<"spacecraft" | "rocket">("spacecraft"),
    [tour, setTour] = useState(() => unseen("workshop-v2"));
  const a = assignments[index],
    v = deriveBuild(build, index),
    signal = a.kind === "signal";
  const visual: Design = {
    ...balancedDesign,
    camera: build.payload === "detail" ? "detail" : "context",
    radio: build.radio === "dish" ? "strong" : "basic",
    solar: build.solar === "wide" ? "large" : "small",
    battery: build.battery === "reserve" ? "large" : "small",
    storage: build.recorder === "large" ? "large" : "small",
    launcher: build.booster === "heavy" ? "heavy" : "light",
  };
  const orbitState = useRef(createState(visual));
  const rocketState = newLaunch(v.rocket);
  const keys: (keyof Build)[] =
    tab === "rocket"
      ? ["booster", "upper", "fuel"]
      : signal
        ? ["solar", "battery", "radio"]
        : a.kind === "dock" || a.kind === "land"
          ? ["battery", "solar", "fuel"]
          : ["payload", "solar", "battery", "radio", "recorder"];
  return (
    <section className="workshop">
      <div className="workshop-visual">
        <div className="workshop-heading">
          <span className="eyebrow">MISSION WORKSHOP · LEVEL {index + 1}</span>
          <h1>
            {tab === "rocket" ? "Build the ride." : "Build your explorer."}
          </h1>
          <p>
            Fixed attachment slots. Your choices change mass, cost and
            performance; this is a component configuration builder.
          </p>
        </div>
        <div className="workshop-preview">
          {tab === "rocket" ? (
            <LaunchScene
              state={rocketState}
              heavy={build.booster === "heavy"}
              reduced={true}
            />
          ) : (
            <Scene design={visual} state={orbitState.current} reduced={true} />
          )}
        </div>
        <div className="workshop-summary">
          <div>
            <span>CRAFT WET MASS</span>
            <b>{v.mass.toFixed(0)} kg</b>
          </div>
          <div>
            <span>SOLAR / RADIO + BUS</span>
            <b>
              {v.solar} / {v.radioW + 8} W
            </b>
          </div>
          <div>
            <span>LINK / RECORDER</span>
            <b>
              {v.radio} MiB/s · {v.storage} MiB
            </b>
          </div>
        </div>
      </div>
      <div className="workshop-controls">
        <div className="workshop-title">
          <div>
            <span className="eyebrow">DESIGN BEFORE YOU FLY</span>
            <h2>{a.title}</h2>
          </div>
          <button className="text-button" onClick={() => setTour(true)}>
            <HelpCircle size={18} /> Walkthrough
          </button>
        </div>
        <div className="workshop-tabs" data-guide="workshop-tabs">
          <button
            className={tab === "spacecraft" ? "active" : ""}
            onClick={() => setTab("spacecraft")}
          >
            <Satellite size={16} /> Spacecraft
          </button>
          <button
            className={tab === "rocket" ? "active" : ""}
            onClick={() => setTab("rocket")}
          >
            <Rocket size={16} /> Rocket
          </button>
        </div>
        <div className="workshop-budget" data-guide="workshop-constraints">
          <span>FICTIONAL MISSION ALLOCATION</span>
          <b className={v.cost > v.budget ? "danger" : ""}>
            ${v.cost.toFixed(1)}M <small>/ ${v.budget}M</small>
          </b>
          <div className="bar">
            <i
              style={{ width: `${Math.min(100, (v.cost / v.budget) * 100)}%` }}
            />
          </div>
          <p>
            {v.mass.toFixed(0)} / {v.capacity} kg delivery capacity ·{" "}
            {v.battery} Wh battery
          </p>
        </div>
        <div className="workshop-parts" data-guide="workshop-parts">
          {keys.map((key) => (
            <label key={key}>
              <span>
                {
                  {
                    solar: "Solar panels — generate power",
                    battery: "Battery — store energy",
                    radio: "Antenna + radio — send data",
                    recorder: "Recorder — store measurements",
                    payload: "Payload — collect science",
                    booster: "Booster — lift from Earth",
                    upper: "Upper stage — reach your destination",
                    fuel: "Propellant — ascent & landing reserve",
                  }[key]
                }
              </span>
              <select
                aria-label={`Build ${key}`}
                value={build[key]}
                onChange={(ev) =>
                  onChange({ ...build, [key]: ev.target.value })
                }
              >
                {buildChoices[key].map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name} · {part.hint}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="workshop-review" data-guide="workshop-review">
          {v.blocks.length === 0 ? (
            <p className="workshop-ok">
              <Check size={15} /> Fits the budget and delivery constraints.
            </p>
          ) : (
            v.blocks.map((block) => (
              <p className="workshop-block" key={block}>
                <AlertTriangle size={16} />
                {block}
              </p>
            ))
          )}
          {v.risks.map((risk) => (
            <p className="workshop-risk" key={risk}>
              <AlertTriangle size={14} />
              {risk}
            </p>
          ))}
        </div>
        <button
          className="primary"
          disabled={v.blocks.length > 0}
          onClick={() => onCommit(false)}
        >
          Launch this design <ArrowRight size={17} />
        </button>
        {certificate && (
          <button
            className="secondary"
            disabled={v.blocks.length > 0}
            onClick={() => onCommit(true)}
          >
            Use certificate to deploy this design
          </button>
        )}
        <p className="career-micro">
          Parts and costs are fictional training specifications. A feasible
          design can still fail through poor energy, fuel or operating
          decisions.
        </p>
      </div>
      {tour && (
        <Coach
          steps={[
            {
              title: "Start with the objective.",
              body: "Your spacecraft must accomplish the assignment, not just survive launch. Build the explorer and the rocket that carries it.",
            },
            {
              title: "Choose actual hardware.",
              body: "Change panels, battery and radio. Bigger is not always better: higher capability adds cost and mass. These selections feed the mission simulation.",
              target: '[data-guide="workshop-parts"]',
            },
            {
              title: "Design the launch vehicle too.",
              body: "The Rocket tab changes booster, upper stage and propellant. Booster choice affects thrust and payload capacity; tank choice changes fuel carried.",
              target: '[data-guide="workshop-tabs"]',
            },
            {
              title: "Check the constraints.",
              body: "Stay within the allocation and the rocket’s payload limit. Late missions require a deep-space stage or a heavier booster.",
              target: '[data-guide="workshop-constraints"]',
            },
            {
              title: "Warnings are real trade-offs.",
              body: "A design may pass review yet have a power deficit, tight fuel reserve, or insufficient data storage. You decide whether to change it or operate around the risk.",
              target: '[data-guide="workshop-review"]',
            },
          ]}
          onClose={() => {
            markSeen("workshop-v2");
            setTour(false);
          }}
        />
      )}
    </section>
  );
}
