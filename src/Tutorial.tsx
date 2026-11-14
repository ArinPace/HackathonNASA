import { Check, ArrowRight, X } from "lucide-react";
const lessons = [
  {
    title: "Start with your robot’s eyes.",
    body: "Payload means the cameras and sensors carried by your explorer. Pick Context imager: a simple survey camera that takes pictures without filling storage too quickly.",
    task: "Select Context imager in Payload.",
  },
  {
    title: "Give your robot a connection home.",
    body: "Comms means communications. Open it and pick High-gain dish: a bigger antenna that can send your pictures back to Earth faster.",
    task: "Comms → High-gain dish.",
  },
  {
    title: "Check the whole spacecraft.",
    body: "Your instrument and antenna work together. Review the mission to check budget, delivery capacity and risks before committing.",
    task: "Press Review mission.",
  },
  {
    title: "Time for the rocket ride.",
    body: "Go to the launchpad, start the countdown and drop the empty booster when prompted. Then follow the guided journey to the Moon.",
    task: "Go to launchpad → countdown → separate booster → travel to the Moon.",
  },
  {
    title: "Your first survey pass.",
    body: "You are circling the Moon. A target window is a chance to see a place we want to study. Press Observe (1) to take pictures and readings. We pause after your first discoveries.",
    task: "Press Observe. Collect at least 8 MiB.",
  },
  {
    title: "Send your first discovery home.",
    body: "Your pictures are still on the robot. Downlink just means send them home. Press Downlink (2) while Earth is in view; a discovery counts when its picture and sensor reading arrive.",
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
