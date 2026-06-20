"use client";
import { useApp } from "@/lib/store";

export default function Header({ mode, setMode, onHome, drS }) {
  const { notes, setNotesOpen, setSettingsOpen, setReviewOpen, dueCount } = useApp();

  const showProg = mode === "deepread" && drS.step === "think";
  const total = drS.claims.length;
  let done = 0;
  for (const k in drS.an) { if (drS.an[k] && String(drS.an[k]).trim()) done++; }
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-bdr flex-shrink-0">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onHome} className="text-muted hover:text-fg transition-colors text-sm bg-transparent border-none cursor-pointer font-[inherit]">
            <i className="fas fa-arrow-left mr-1.5" /><span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px bg-bdr" />
          <div className="flex gap-1 bg-card rounded-lg p-1">
            <button onClick={() => setMode("deepread")} className={"tb" + (mode === "deepread" ? " on" : "")}><i className="fas fa-layer-group sm:mr-1.5 text-xs" /><span className="hidden sm:inline">Deep Read</span></button>
            <button onClick={() => setMode("read")} className={"tb" + (mode === "read" ? " on" : "")}><i className="fas fa-book-open sm:mr-1.5 text-xs" /><span className="hidden sm:inline">Read</span></button>
            <button onClick={() => setMode("chat")} className={"tb" + (mode === "chat" ? " on" : "")}><i className="fas fa-comments sm:mr-1.5 text-xs" /><span className="hidden sm:inline">AI Companion</span></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showProg && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 h-1.5 bg-bdr rounded-full overflow-hidden"><div className="pb" style={{ width: pct + "%" }} /></div>
                <span className="text-[11px] text-muted whitespace-nowrap">{done}/{total} notes</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-bdr" />
            </>
          )}
          <button onClick={() => setReviewOpen(true)} title="Review notes" className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-fg hover:bg-card transition-all text-sm bg-transparent border-none cursor-pointer">
            <i className="fas fa-rotate" />
            {dueCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-sage text-bg text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{dueCount > 9 ? "9+" : dueCount}</span>
            )}
          </button>
          <button onClick={() => setNotesOpen(true)} className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-fg hover:bg-card transition-all text-sm bg-transparent border-none cursor-pointer">
            <i className="fas fa-bookmark" />
            {notes.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-bg text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{notes.length}</span>
            )}
          </button>
          <button onClick={() => setSettingsOpen(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-fg hover:bg-card transition-all text-sm bg-transparent border-none cursor-pointer">
            <i className="fas fa-gear" />
          </button>
        </div>
      </div>
    </header>
  );
}
