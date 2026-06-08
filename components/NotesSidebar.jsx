"use client";
import { useApp } from "@/lib/store";

function plain(content) {
  return String(content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().substring(0, 150);
}

function fullPlain(content) {
  return String(content || "").replace(/<[^>]*>/g, " ").replace(/[ \t]+/g, " ").trim();
}

function download(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function NotesSidebar() {
  const { notes, notesOpen, setNotesOpen, delNote, clrNotes } = useApp();

  function exportMd() {
    const date = new Date().toISOString().slice(0, 10);
    let md = "# Read to Think — Notes\n\n_Exported " + date + "_\n";
    for (const n of notes) {
      const kind = n.type === "dr" ? "Deep Read" : "Chat";
      md += "\n## " + (n.book || "Untitled") + " · " + kind + "\n\n" + fullPlain(n.content) + "\n";
    }
    download("read-to-think-notes-" + date + ".md", md, "text/markdown");
  }

  function exportJson() {
    const date = new Date().toISOString().slice(0, 10);
    download("read-to-think-notes-" + date + ".json", JSON.stringify(notes, null, 2), "application/json");
  }

  return (
    <>
      <div className={"fixed inset-0 bg-black/40 z-[998]" + (notesOpen ? "" : " hidden")} onClick={() => setNotesOpen(false)} />
      <aside className={"sp fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-bg border-l border-bdr z-[999] flex flex-col" + (notesOpen ? "" : " shut")}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-bdr">
          <h3 className="serif font-semibold text-sm">Your Notes</h3>
          <button onClick={() => setNotesOpen(false)} className="text-muted hover:text-fg transition-colors text-sm bg-transparent border-none cursor-pointer">
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!notes.length ? (
            <p className="text-muted text-sm text-center py-12">No notes yet.</p>
          ) : (
            notes.slice().reverse().map((n, i) => {
              const pl = plain(n.content);
              return (
                <div key={n.ts + "-" + i} className="bg-card border border-bdr rounded-lg p-3 anim-up" style={{ animationDelay: i * 0.04 + "s" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted/70">
                      {n.book}
                      {n.type === "dr" ? (
                        <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded ml-1">Deep Read</span>
                      ) : (
                        <span className="text-[9px] bg-sage/15 text-sage px-1.5 py-0.5 rounded ml-1">Chat</span>
                      )}
                    </span>
                    <button onClick={() => delNote(n.ts)} className="text-muted/30 hover:text-terra text-xs transition-colors cursor-pointer bg-transparent border-none">
                      <i className="fas fa-xmark" />
                    </button>
                  </div>
                  <p className="text-xs text-fg/60 leading-relaxed">{pl}{pl.length >= 150 ? "..." : ""}</p>
                </div>
              );
            })
          )}
        </div>
        <div className="px-4 py-3 border-t border-bdr flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={exportMd} disabled={!notes.length} className="text-[11px] text-muted/60 hover:text-accent transition-colors cursor-pointer bg-transparent border-none font-[inherit] disabled:opacity-30 disabled:cursor-not-allowed">
              <i className="fas fa-file-arrow-down mr-1" />.md
            </button>
            <button onClick={exportJson} disabled={!notes.length} className="text-[11px] text-muted/60 hover:text-accent transition-colors cursor-pointer bg-transparent border-none font-[inherit] disabled:opacity-30 disabled:cursor-not-allowed">
              <i className="fas fa-file-code mr-1" />.json
            </button>
          </div>
          <button onClick={clrNotes} className="text-[11px] text-muted/50 hover:text-terra transition-colors cursor-pointer bg-transparent border-none font-[inherit]">Clear all</button>
        </div>
      </aside>
    </>
  );
}
