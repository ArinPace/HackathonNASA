import { useEffect, useState, useRef } from "react";
import { ArrowRight, X } from "lucide-react";
export type Lesson = { title: string; body: string; target?: string };
export function unseen(key: string) {
  try {
    return localStorage.getItem("ols-guide-" + key) !== "seen";
  } catch {
    return true;
  }
}
export function markSeen(key: string) {
  try {
    localStorage.setItem("ols-guide-" + key, "seen");
  } catch {}
}
export function Coach({
  steps,
  onClose,
}: {
  steps: Lesson[];
  onClose: () => void;
}) {
  const card = useRef<HTMLElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    card.current?.querySelector<HTMLButtonElement>("button.primary")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close.current();
      }
      if (e.key === "Tab") {
        const buttons = Array.from(
          card.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
        );
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("keydown", key, true);
      previous?.focus();
    };
  }, []);
  const [step, setStep] = useState(0),
    [rect, setRect] = useState<DOMRect | null>(null);
  const lesson = steps[step];
  useEffect(() => {
    const el = lesson.target ? document.querySelector(lesson.target) : null;
    el?.scrollIntoView({ block: "center", behavior: "instant" });
    const measure = () => setRect(el?.getBoundingClientRect() ?? null);
    const id = setTimeout(measure, 70);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step, lesson.target]);
  return (
    <div className="coach-layer">
      <div className="coach-dimmer" />
      {rect && (
        <div
          className="coach-spotlight"
          style={{
            top: rect.top - 5,
            left: rect.left - 5,
            width: rect.width + 10,
            height: rect.height + 10,
          }}
        />
      )}
      <section
        ref={card}
        className="coach-popup"
        role="dialog"
        aria-label="Interactive mission walkthrough"
        aria-modal="true"
      >
        <div className="coach-top">
          <span>
            WALKTHROUGH · {step + 1}/{steps.length} · TIME PAUSED
          </span>
          <button onClick={onClose} aria-label="Close walkthrough">
            <X size={16} />
          </button>
        </div>
        <div className="coach-progress">
          {steps.map((_, i) => (
            <i key={i} className={i <= step ? "done" : ""} />
          ))}
        </div>
        <h3>{lesson.title}</h3>
        <p>{lesson.body}</p>
        <div className="coach-popup-actions">
          <button className="text-button" onClick={onClose}>
            Skip walkthrough
          </button>
          <button
            className="primary"
            onClick={() =>
              step + 1 < steps.length ? setStep(step + 1) : onClose()
            }
          >
            {step + 1 < steps.length ? "Next tip" : "Try it myself"}
            <ArrowRight size={16} />
          </button>
        </div>
        <small>
          Tips pause the simulation. They never select parts, operate controls,
          or award progress for you.
        </small>
      </section>
    </div>
  );
}
