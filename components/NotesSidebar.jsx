"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";

const keyOf = (n) => String(n.ts);

function plain(content) {
  return String(content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().substring(0, 150);
}

function snippet(content, len = 42) {
  const p = plain(content);
  return p.length > len ? p.slice(0, len) + "…" : p;
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
  const { notes, notesOpen, setNotesOpen, delNote, clrNotes, links, toggleNoteLink } = useApp();
  const [linkingKey, setLinkingKey] = useState(null);

  const byKey = {};
  for (const n of notes) byKey[keyOf(n)] = n;

  function exportMd() {
    const date = new Date().toISOString().slice(0, 10);
    let md = "# Read to Think — Notes\n\n_Exported " + date + "_\n";
    for (const n of notes) {
      const kind = n.type === "dr" ? "Deep Read" : "Chat";
      md += "\n## " + (n.book || "Untitled") + " · " + kind + "\n\n" + fullPlain(n.content) + "\n";
      const linked = (links[keyOf(n)] || []).map((k) => byKey[k]).filter(Boolean);
      if (linked.length) {
        // Obsidian-flavored: link by note snippet
        md += "\nLinked: " + linked.map((l) => "[[" + snippet(l.content, 60).replace(/[\[\]]/g, "") + "]]").join(", ") + "\n";
      }
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
              const k = keyOf(n);
              const linkedKeys = links[k] || [];
              const isLinking = linkingKey === k;
              const others = notes.filter((o) => keyOf(o) !== k);
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLinkingKey(isLinking ? null : k)}
                        title="Link to another note"
                        className={"relative text-xs transition-colors cursor-pointer bg-transparent border-none " + (linkedKeys.length || isLinking ? "text-accent" : "text-muted/30 hover:text-accent")}
                      >
                        <i className="fas fa-link" />
                        {linkedKeys.length > 0 && <span className="ml-0.5 text-[9px] align-top">{linkedKeys.length}</span>}
                      </button>
                      <button onClick={() => delNote(n.ts)} className="text-muted/30 hover:text-terra text-xs transition-colors cursor-pointer bg-transparent border-none">
                        <i className="fas fa-xmark" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-fg/60 leading-relaxed">{pl}{pl.length >= 150 ? "..." : ""}</p>

                  {linkedKeys.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {linkedKeys.map((lk) => byKey[lk] && (
                        <span key={lk} title={plain(byKey[lk].content)} className="text-[10px] bg-accent/10 text-accent/90 border border-accent/20 rounded px-1.5 py-0.5">
                          <i className="fas fa-link text-[8px] mr-1" />{snippet(byKey[lk].content, 24)}
                        </span>
                      ))}
                    </div>
                  )}

                  {isLinking && (
                    <div className="mt-3 border-t border-bdr pt-2">
                      <p className="text-[10px] text-muted/60 mb-1.5">Connect to:</p>
                      {!others.length ? (
                        <p className="text-[10px] text-muted/40 italic">Write another note first.</p>
                      ) : (
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {others.map((o) => {
                            const ok = keyOf(o);
                            const on = linkedKeys.includes(ok);
                            return (
                              <button
                                key={ok}
                                onClick={() => toggleNoteLink(k, ok)}
                                className={"w-full text-left flex items-center gap-2 text-[11px] rounded px-2 py-1 transition-colors cursor-pointer bg-transparent border-none " + (on ? "text-accent" : "text-muted/70 hover:text-fg")}
                              >
                                <i className={"fas " + (on ? "fa-circle-check text-accent" : "fa-circle text-muted/30") + " text-[10px]"} />
                                <span className="truncate">{snippet(o.content, 30)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
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
