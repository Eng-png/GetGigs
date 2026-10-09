import { X } from "lucide-react";

const STEPS = [
  { title: "Your reusable artist profile", text: "Keep bios, music links, availability, photos, and booking assets ready for every opportunity.", section: "profile" },
  { title: "Browse compatible venues", text: "GetGigs matches venues based on genre, location, capacity, and booking requirements.", section: "explore" },
  { title: "Understand every match", text: "Open a venue to see why it matches, what the room requires, and how the opportunity pays.", section: "explore" },
  { title: "Save a shortlist", text: "Saved always uses the same live venue records as Explore, including your own edits.", section: "saved" },
  { title: "Prepare the booking", text: "Review the sample contact workflow safely. Demo mode never sends real emails or submissions.", section: "explore" },
] as const;

export default function DemoCoach({ step, onStep, onNavigate, onExit }: { step: number; onStep: (step: number) => void; onNavigate: (section: "explore" | "saved" | "profile") => void; onExit: () => void }) {
  const current = STEPS[step];
  return <aside className="gg-demo-coach" aria-live="polite"><button type="button" onClick={onExit} aria-label="Exit demo"><X size={15}/></button><span>Demo · {step + 1} of {STEPS.length}</span><strong>{current.title}</strong><p>{current.text}</p><div><button type="button" disabled={step === 0} onClick={() => { const next = step - 1; onStep(next); onNavigate(STEPS[next].section); }}>Back</button><button type="button" onClick={() => { if (step === STEPS.length - 1) return onExit(); const next = step + 1; onStep(next); onNavigate(STEPS[next].section); }}>{step === STEPS.length - 1 ? "Finish demo" : "Next"}</button></div></aside>;
}
