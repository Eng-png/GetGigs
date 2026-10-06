import { useEffect, useState } from "react";
import { DesktopWrapper } from "./components/DesktopWrapper";
import { MobileWrapper } from "./components/MobileWrapper";

export type Version = {
  id: string;
  label: string;
  subtitle: string;
  copy: string;
  notes: string;
  up: number;
  down: number;
  vote: "up" | "down" | null;
};

const SEED: Version[] = [
  {
    id: "v1",
    label: "V1",
    subtitle: "Gallery first",
    copy: "Let the photos lead, one place at a time.",
    notes: "",
    up: 0,
    down: 0,
    vote: null,
  },
  {
    id: "v2",
    label: "V2",
    subtitle: "Scan & save",
    copy: "Everything at a glance, swipe to keep.",
    notes: "",
    up: 0,
    down: 0,
    vote: null,
  },
  {
    id: "v3",
    label: "V3",
    subtitle: "Image led",
    copy: "Quiet confidence, one step at a time.",
    notes: "",
    up: 0,
    down: 0,
    vote: null,
  },
];

let nextId = 4;
const makeId = () => `v${nextId++}`;

export default function App() {
  const [versions, setVersions] = useState<Version[]>(SEED);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<"intro" | "version">("intro");
  const [projectTitle, setProjectTitle] = useState("Yondr Summary Screen");
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 600px)").matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 600px)");
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const selectIntro = () => setView("intro");
  const selectVersion = (id: string) => {
    setActiveId(id);
    setView("version");
  };

  const addVersion = () => {
    const id = makeId();
    const label = `V${versions.length + 1}`;
    const v: Version = { id, label, subtitle: "", copy: "", notes: "", up: 0, down: 0, vote: null };
    setVersions((vs) => [...vs, v]);
    setActiveId(id);
    setView("version");
  };

  const renameVersion = (id: string, label: string) =>
    setVersions((vs) => vs.map((v) => (v.id === id ? { ...v, label } : v)));

  const duplicateVersion = (id: string) => {
    setVersions((vs) => {
      const idx = vs.findIndex((v) => v.id === id);
      if (idx < 0) return vs;
      const src = vs[idx];
      const newId = makeId();
      const copy: Version = { ...src, id: newId, label: `${src.label} copy`, up: 0, down: 0, vote: null };
      const next = [...vs];
      next.splice(idx + 1, 0, copy);
      setActiveId(newId);
      return next;
    });
  };

  const deleteVersion = (id: string) => {
    setVersions((vs) => {
      const idx = vs.findIndex((v) => v.id === id);
      if (idx < 0) return vs;
      const next = vs.filter((v) => v.id !== id);
      if (activeId === id) {
        if (next.length === 0) {
          setActiveId(null);
          setView("intro");
        } else {
          const prev = next[Math.max(0, idx - 1)];
          setActiveId(prev.id);
        }
      }
      return next;
    });
  };

  const updateVersion = (id: string, patch: Partial<Version>) =>
    setVersions((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const currentIdx = activeId ? versions.findIndex((v) => v.id === activeId) : -1;
  const canPrev = view === "version" ? currentIdx > 0 : false;
  const canNext = view === "version" ? currentIdx >= 0 && currentIdx < versions.length - 1 : versions.length > 0;

  const goPrev = () => {
    if (view !== "version" || currentIdx <= 0) return;
    setActiveId(versions[currentIdx - 1].id);
  };
  const goNext = () => {
    if (view === "intro") {
      if (versions[0]) selectVersion(versions[0].id);
      return;
    }
    if (currentIdx >= 0 && currentIdx < versions.length - 1) {
      setActiveId(versions[currentIdx + 1].id);
    }
  };

  if (isDesktop) {
    return (
      <DesktopWrapper
        versions={versions}
        view={view}
        activeId={activeId}
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
        selectIntro={selectIntro}
        selectVersion={selectVersion}
        addVersion={addVersion}
        renameVersion={renameVersion}
        duplicateVersion={duplicateVersion}
        deleteVersion={deleteVersion}
        updateVersion={updateVersion}
        goPrev={goPrev}
        goNext={goNext}
        canPrev={canPrev}
        canNext={canNext}
      />
    );
  }

  const mobileActiveId = activeId ?? versions[0]?.id ?? null;
  const mobileIdx = versions.findIndex((v) => v.id === mobileActiveId);

  return (
    <MobileWrapper
      versions={versions}
      view={view}
      activeId={mobileActiveId}
      selectIntro={selectIntro}
      selectVersion={selectVersion}
      updateVersion={updateVersion}
      goPrev={() => {
        if (mobileIdx > 0) setActiveId(versions[mobileIdx - 1].id);
      }}
      goNext={() => {
        if (mobileIdx >= 0 && mobileIdx < versions.length - 1)
          setActiveId(versions[mobileIdx + 1].id);
      }}
      canPrev={mobileIdx > 0}
      canNext={mobileIdx >= 0 && mobileIdx < versions.length - 1}
    />
  );
}
