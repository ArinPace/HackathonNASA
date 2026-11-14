import { Check, ArrowRight, X } from "lucide-react";
const lessons = [
  {
    title: "Give the mission a camera it can support.",
    body: "In Payload, select Context imager. It generates one fifth of the detailed camera’s data, leaving more room to maneuver.",
    task: "Select Context imager in Payload.",
  },
  {
    title: "Build a route home for your discoveries.",
    body: "Open Comms and install the High-gain dish. It costs more and draws more power, but transmits sixteen times faster.",
    task: "Comms → High-gain dish.",
  },
  {
    title: "Check the whole spacecraft.",
    body: "Your instrument and antenna work together. Review the mission to check budget, delivery capacity and risks before committing.",
    task: "Press Review mission.",
  },
  {
    title: "You are cleared for lunar deployment.",
    body: "The launch service delivers you to lunar orbit. You will control the science, antenna and solar pointing yourself.",
    task: "Press Commit & deploy.",
  },
  {
    title: "Your first survey pass.",
    body: "We have coasted to the edge of the real target window. Press Observe (1). Watch the recorder fill; we will pause after your first observations.",
    task: "Press Observe. Collect at least 8 MiB.",
  },
  {
    title: "Stored aboard is not delivered.",
    body: "Your evidence is still on the spacecraft. Press Downlink (2) while Earth is in view. Paired evidence counts only after both measurements arrive.",
    task: "Press Downlink. Return your first paired cell.",
  },
  {
    title: "Give the spacecraft a breather.",
    body: "Press Charge (3) to turn the panels toward the Sun. A spacecraft’s energy, time and science objectives must work together.",
    task: "Press Charge to finish training.",
  },
];
export function Tutorial({
  step,
  ready,
  onNext,
  onClose,
}: {
  step: number;
  ready: boolean;
  onNext: () => void;
  onClose: () => void;
}) {
  const l = lessons[step];
  if (!l) return null;
  return (
    <section className="coach" aria-label="Mission walkthrough">
      <div className="coach-top">
        <span>
          FLIGHT SCHOOL · {step + 1} / {lessons.length}
        </span>
        <button onClick={onClose} aria-label="Exit walkthrough">
          <X size={14} />
        </button>
      </div>
      <div className="coach-progress">
        {lessons.map((_, i) => (
          <i key={i} className={i <= step ? "done" : ""} />
        ))}
      </div>
      <h3>{l.title}</h3>
      <p>{l.body}</p>
      <div className="coach-task">
        {ready ? <Check size={15} /> : <span className="live-dot" />}
        {ready ? "Step complete. Nice work." : l.task}
      </div>
      <button className="primary" onClick={onNext} disabled={!ready}>
        {step === 6 ? "Complete flight school" : "Continue"}
        <ArrowRight size={15} />
      </button>
    </section>
  );
}
