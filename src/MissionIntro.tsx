import { useState } from "react";
import {
  Rocket,
  Satellite,
  Camera,
  Radio,
  Sun,
  Battery,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
export function MissionIntro({
  onGuided,
  onFree,
  career = false,
}: {
  onGuided: () => void;
  onFree: () => void;
  career?: boolean;
}) {
  const [page, setPage] = useState(0);
  return (
    <div className="overlay">
      <section
        className="modal mission-intro"
        role="dialog"
        aria-label="Mission explained from the basics"
        aria-modal="true"
      >
        <div className="intro-top">
          <span className="eyebrow">
            YOUR FIRST SPACE MISSION · {page + 1} / 3
          </span>
          <span>NO SPACE KNOWLEDGE NEEDED</span>
        </div>
        <div className="intro-journey">
          <span className={page === 0 ? "lit" : ""}>🌍</span>
          <i />
          <Rocket size={28} />
          <i />
          <span>🌕</span>
          <i />
          <Radio size={24} />
          <i />
          <span>🌍</span>
        </div>
        {page === 0 ? (
          <>
            <h2>
              {career ? "Start with a satellite." : "Send a robot to the Moon."}
              <br />
              <em>
                {career
                  ? "Earn your way to Mars."
                  : "Bring its discoveries home."}
              </em>
            </h2>
            <p>
              {career
                ? "You start with a small robot satellite near Earth. Learn power, radio, flying and landing across 18 assignments. Every completed assignment earns XP and opens the next step."
                : "You are in charge of a small robot explorer. It has no people aboard. You choose its equipment, launch it on a rocket, then tell it what to do near the Moon."}
            </p>
            <div className="intro-distinction">
              <div>
                <Rocket />
                <b>The rocket is the ride.</b>
                <p>
                  It burns fuel to push the explorer off Earth. Empty rocket
                  stages drop away to make it lighter.
                </p>
              </div>
              <div>
                <Satellite />
                <b>The explorer does the work.</b>
                <p>
                  {career
                    ? "First near Earth, later the Moon and Mars: your explorer performs the assignment and sends information home."
                    : "After the ride, it circles the Moon, takes pictures and sends information back to Earth."}
                </p>
              </div>
            </div>
            <p className="intro-goal">
              {career ? (
                <>
                  <b>Your first goal:</b> deploy a small satellite and send a
                  test signal home. Later assignments add cameras, docking, Moon
                  landings and Mars. Complete each goal to unlock the next step.
                </>
              ) : (
                <>
                  <b>Your goal:</b> send pictures AND sensor readings home from
                  three different survey areas. A picture stuck on the robot
                  does not count!
                </>
              )}
            </p>
          </>
        ) : page === 1 ? (
          <>
            <h2>
              Think of it as a phone.
              <br />
              <em>On a very long trip.</em>
            </h2>
            <div className="intro-parts">
              {[
                {
                  Icon: Camera,
                  title: "Cameras & sensors",
                  body: "Your eyes. Collect pictures and practice readings that give clues about possible water.",
                },
                {
                  Icon: Battery,
                  title: "Battery & solar panels",
                  body: "Your charger. The Sun supplies energy; the battery carries you through darkness.",
                },
                {
                  Icon: Satellite,
                  title: "Storage",
                  body: "Your photo library. Once it fills up, there is no room for new discoveries.",
                },
                {
                  Icon: Radio,
                  title: "Antenna",
                  body: "Your connection home. Sends the stored information to Earth.",
                },
              ].map((p) => (
                <div key={p.title}>
                  <p.Icon />
                  <section>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </section>
                </div>
              ))}
            </div>
            <p className="intro-goal">
              A fancier camera makes more data. That helps only if you have
              enough power, space to store it, and a good enough connection to
              send it home.
            </p>
          </>
        ) : (
          <>
            <h2>
              One mission.
              <br />
              <em>You make the calls.</em>
            </h2>
            <ol className="intro-route">
              <li>
                <b>Build</b>
                <span>
                  Pick equipment within your pretend $40M budget. The
                  walkthrough helps.
                </span>
              </li>
              <li>
                <b>Launch</b>
                <span>
                  Start the engines, watch Earth fall away, and separate the
                  empty booster.
                </span>
              </li>
              <li>
                <b>Travel</b>
                <span>
                  {career
                    ? "The service guides you to the selected destination. A launch certificate lets you skip repeated launches after your first."
                    : "The launch service guides the trip to the Moon in a short animated sequence."}
                </span>
              </li>
              <li>
                <b>Explore & send</b>
                <span>
                  “Observe” collects discoveries. “Downlink” means send them to
                  Earth. “Charge” restores energy in sunlight.
                </span>
              </li>
            </ol>
            <p className="intro-goal">
              <b>What is an orbit?</b> A path around a world.{" "}
              {career
                ? "Your first satellite circles Earth. Later you apply the same mission loop farther away, with more demanding tasks and tighter margins."
                : "Our explorer circles the Moon; useful places and Earth come in and out of view. We pause the first mission to explain what to do."}
            </p>
          </>
        )}
        <div className="intro-controls">
          {page > 0 && (
            <button className="secondary" onClick={() => setPage(page - 1)}>
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <button
            className="primary"
            onClick={() => (page < 2 ? setPage(page + 1) : onGuided())}
          >
            {page === 0
              ? "Explain my equipment"
              : page === 1
                ? "Show me the journey"
                : "Start guided first mission"}
            <ArrowRight size={17} />
          </button>
        </div>
        <button className="intro-skip" onClick={onFree}>
          Enter the assembly bay — skip explanation
        </button>
      </section>
    </div>
  );
}
