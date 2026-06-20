"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApp } from "@/lib/store";
import { putBook, putMark, delMark, marksFor, uid } from "@/lib/idb";
import { REACTIONS, reactById, toBlocks } from "@/lib/reader";
import ReaderAI from "@/components/ReaderAI";

const colorCls = {
  accent: "bg-accent/25 border-b border-accent",
  sage: "bg-sage/25 border-b border-sage",
  terra: "bg-terra/25 border-b border-terra",
  muted: "bg-muted/20 border-b border-muted",
  fg: "bg-fg/15 border-b border-fg/50",
};

export default function Reader({ book, onClose, onSendToDeepRead }) {
  const { toast, addNote } = useApp();
  const blocks = useMemo(() => toBlocks(book.text), [book.text]);
  const [marks, setMarks] = useState([]);
  const [sel, setSel] = useState(null);        // { blockIdx, start, end, text }
  const [noteFor, setNoteFor] = useState(null); // reaction id when capturing a note
  const [noteDraft, setNoteDraft] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [gate, setGate] = useState(null);       // { mark } recall gate on return
  const [gateAns, setGateAns] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [ai, setAi] = useState(null);           // { mode, passage } AI panel
  const scrollRef = useRef(null);
  const posTimer = useRef(null);
  const started = useRef(Date.now());

  // passage currently in the viewport — what "Quiz me" tests
  function visiblePassage() {
    const root = scrollRef.current;
    if (!root) return "";
    const top = root.scrollTop, bot = top + root.clientHeight;
    const ps = root.querySelectorAll("[data-bi]");
    const out = [];
    for (const p of ps) {
      const a = p.offsetTop, b = a + p.offsetHeight;
      if (b > top && a < bot) out.push(p.textContent);
      if (out.join(" ").length > 1800) break;
    }
    return out.join("\n\n").slice(0, 1800) || (blocks[0] || "");
  }

  function saveAsNote(text) {
    addNote({ content: text, book: book.title, ts: Date.now(), type: "read" });
  }

  // load marks + decide recall gate
  useEffect(() => {
    let live = true;
    marksFor(book.id).then((ms) => {
      if (!live) return;
      setMarks(ms);
      if (book.pos > 0 && ms.length) {
        const recent = [...ms].sort((a, b) => b.ts - a.ts)[0];
        setGate({ mark: recent });
      } else {
        restorePos();
      }
    });
    putBook({ ...book, lastOpened: Date.now() }).catch(() => {});
    return () => { live = false; };
  }, [book.id]);

  // session timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  function restorePos() {
    requestAnimationFrame(() => {
      if (scrollRef.current && book.pos > 0) scrollRef.current.scrollTop = book.pos;
    });
  }

  const onScroll = useCallback(() => {
    if (posTimer.current) clearTimeout(posTimer.current);
    posTimer.current = setTimeout(() => {
      const top = scrollRef.current ? scrollRef.current.scrollTop : 0;
      putBook({ ...book, pos: top, lastOpened: Date.now() }).catch(() => {});
    }, 600);
  }, [book]);

  // capture a single-block text selection
  function onSelect() {
    const s = window.getSelection && window.getSelection();
    if (!s || s.isCollapsed) return;
    const text = s.toString().trim();
    if (text.length < 3) return;
    let node = s.anchorNode;
    while (node && node.nodeType !== 1) node = node.parentNode;
    const blk = node && node.closest ? node.closest("[data-bi]") : null;
    if (!blk) return;
    const blockIdx = Number(blk.getAttribute("data-bi"));
    const raw = blocks[blockIdx] || "";
    const start = raw.indexOf(text);
    if (start < 0) return; // spans blocks / styled split — skip in Phase 1
    setSel({ blockIdx, start, end: start + text.length, text });
    setNoteFor(null); setNoteDraft("");
  }

  async function commit(reactionId) {
    if (!sel) return;
    const r = reactById(reactionId);
    if (r.prompt && noteFor !== reactionId) { setNoteFor(reactionId); return; }
    const mark = { id: uid(), bookId: book.id, ...sel, reaction: reactionId, note: noteDraft.trim(), ts: Date.now() };
    await putMark(mark);
    setMarks((m) => [...m, mark]);
    clearSel();
    toast("Marked — " + r.label.toLowerCase() + ".");
  }

  function clearSel() {
    setSel(null); setNoteFor(null); setNoteDraft("");
    if (window.getSelection) window.getSelection().removeAllRanges();
  }

  async function removeMark(id) {
    await delMark(id);
    setMarks((m) => m.filter((x) => x.id !== id));
  }

  // render a block, wrapping marked ranges
  function renderBlock(text, idx) {
    const bms = marks.filter((m) => m.blockIdx === idx).sort((a, b) => a.start - b.start);
    if (!bms.length) return text;
    const out = [];
    let cur = 0;
    bms.forEach((m, i) => {
      if (m.start < cur) return; // skip overlap
      if (m.start > cur) out.push(text.slice(cur, m.start));
      const r = reactById(m.reaction);
      out.push(
        <mark key={m.id} title={m.note || r.label}
          className={"rounded-sm px-0.5 text-fg cursor-pointer " + (colorCls[r.color] || colorCls.muted)}
          onClick={() => setDrawer(true)}>
          {text.slice(m.start, m.end)}
          <span className="text-[10px] align-super ml-0.5 opacity-70">{r.sym}</span>
        </mark>
      );
      cur = m.end;
    });
    if (cur < text.length) out.push(text.slice(cur));
    return out;
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* reader sub-bar */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-2 border-b border-bdr flex-shrink-0">
        <button onClick={onClose} className="text-muted hover:text-fg text-sm bg-transparent border-none cursor-pointer">
          <i className="fas fa-arrow-left mr-1.5" />Shelf
        </button>
        <div className="font-serif text-sm text-fg truncate flex-1 min-w-0">{book.title}</div>
        <span className="text-[11px] text-muted tabular-nums hidden sm:inline" title="This session">
          <i className="fas fa-clock mr-1" />{mm}:{ss}
        </span>
        <button onClick={() => setAi({ mode: "quiz", passage: visiblePassage() })} title="Quiz me on what's on screen"
          className="text-muted hover:text-accent text-sm bg-transparent border-none cursor-pointer">
          <i className="fas fa-circle-question" /><span className="hidden sm:inline ml-1 text-xs">Quiz me</span>
        </button>
        <button onClick={() => setDrawer(true)} className="relative text-muted hover:text-fg text-sm bg-transparent border-none cursor-pointer" title="Your marks">
          <i className="fas fa-pen-nib" />
          {marks.length > 0 && <span className="ml-1 text-[11px]">{marks.length}</span>}
        </button>
      </div>

      {/* page */}
      <div ref={scrollRef} onScroll={onScroll} onMouseUp={onSelect} onTouchEnd={onSelect}
        className="flex-1 min-h-0 overflow-y-auto">
        <article className="max-w-2xl mx-auto px-5 md:px-6 py-8 font-serif text-fg leading-[1.85] text-[1.05rem]">
          {blocks.map((b, i) => (
            <p key={i} data-bi={i} className="mb-5 selection:bg-accent/30">{renderBlock(b, i)}</p>
          ))}
          <div className="h-24" />
        </article>
      </div>

      {/* reaction bar — appears on selection. ≥44px taps, mobile-safe bottom dock */}
      {sel && (
        <div className="flex-shrink-0 border-t border-bdr bg-card/95 backdrop-blur-md px-4 py-3 anim-up" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="max-w-2xl mx-auto">
            <div className="text-[11px] text-muted mb-2 line-clamp-2 italic">“{sel.text}”</div>
            {noteFor ? (
              <div className="flex flex-col gap-2">
                <input autoFocus value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") commit(noteFor); }}
                  placeholder={reactById(noteFor).id === "question" ? "What's your question?" : reactById(noteFor).id === "disagree" ? "Why? In your own words." : reactById(noteFor).id === "connect" ? "Connects to what?" : "What changed?"}
                  className="w-full bg-bg border border-bdr rounded-lg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent" />
                <div className="flex gap-2">
                  <button onClick={() => commit(noteFor)} className="px-4 py-2.5 rounded-lg bg-accent text-bg text-sm font-medium border-none cursor-pointer min-h-[44px]">Save mark</button>
                  <button onClick={clearSel} className="px-3 py-2.5 text-muted text-sm bg-transparent border-none cursor-pointer ml-auto">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {REACTIONS.map((r) => (
                  <button key={r.id} onClick={() => commit(r.id)} title={r.label}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-bg border border-bdr text-fg text-sm cursor-pointer hover:border-accent min-h-[44px]">
                    <span className="font-bold text-base">{r.sym}</span>
                    <span className="hidden sm:inline text-xs text-muted">{r.label}</span>
                  </button>
                ))}
                <button onClick={() => { setAi({ mode: "socratic", passage: sel.text }); clearSel(); }} title="Think it through with AI"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-bg border border-bdr text-fg text-sm cursor-pointer hover:border-sage min-h-[44px]">
                  <i className="fas fa-comments text-xs" /><span className="hidden sm:inline text-xs text-muted">Ask</span>
                </button>
                {onSendToDeepRead && (
                  <button onClick={() => { onSendToDeepRead(sel.text); clearSel(); }} title="Think on this in Deep Read"
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-bg border border-bdr text-fg text-sm cursor-pointer hover:border-sage min-h-[44px]">
                    <i className="fas fa-layer-group text-xs" /><span className="hidden sm:inline text-xs text-muted">Think on this</span>
                  </button>
                )}
                <button onClick={clearSel} className="px-2 py-2.5 text-muted text-sm bg-transparent border-none cursor-pointer ml-auto min-h-[44px]">×</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* recall gate — friction on return: reconstruct before you read on */}
      {gate && (
        <div className="fixed inset-0 z-[60] bg-bg/90 backdrop-blur-sm flex items-center justify-center p-4" style={{ height: "100dvh" }}>
          <div className="bg-card border border-bdr rounded-2xl p-6 max-w-md w-full anim-up">
            <div className="text-xs text-muted mb-2">Welcome back. Before you read on —</div>
            <div className="flex items-start gap-2 mb-3">
              <span className="text-accent font-bold text-lg leading-none mt-0.5">{reactById(gate.mark.reaction).sym}</span>
              <p className="font-serif text-fg text-sm leading-relaxed italic">“{gate.mark.text}”</p>
            </div>
            <p className="text-sm text-fg mb-2">Why did this matter? Say it from memory — don't scroll back.</p>
            <textarea autoFocus value={gateAns} onChange={(e) => setGateAns(e.target.value)}
              className="w-full h-24 bg-bg border border-bdr rounded-lg px-3 py-2 text-sm text-fg outline-none focus:border-accent resize-none mb-3" />
            <div className="flex gap-2">
              <button onClick={async () => {
                if (gateAns.trim()) {
                  const upd = { ...gate.mark, note: (gate.mark.note ? gate.mark.note + " · " : "") + "[recall] " + gateAns.trim() };
                  await putMark(upd);
                  setMarks((m) => m.map((x) => x.id === upd.id ? upd : x));
                }
                setGate(null); restorePos();
              }} className="px-4 py-2 rounded-lg bg-accent text-bg text-sm font-medium border-none cursor-pointer">Continue reading</button>
              <button onClick={() => { setGate(null); restorePos(); }} className="px-3 py-2 text-muted text-sm bg-transparent border-none cursor-pointer ml-auto">Skip</button>
            </div>
          </div>
        </div>
      )}

      {/* marks drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[55] flex justify-end" onClick={() => setDrawer(false)}>
          <div className="absolute inset-0 bg-bg/60" />
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-card border-l border-bdr h-full overflow-y-auto" style={{ height: "100dvh" }}>
            <div className="sticky top-0 bg-card border-b border-bdr px-4 py-3 flex items-center justify-between">
              <span className="font-serif text-fg">Your marks <span className="text-muted text-sm">({marks.length})</span></span>
              <button onClick={() => setDrawer(false)} className="text-muted hover:text-fg bg-transparent border-none cursor-pointer"><i className="fas fa-xmark" /></button>
            </div>
            <div className="p-4 grid gap-3">
              {marks.length === 0 && <p className="text-sm text-muted">No marks yet. Select a sentence and react to it.</p>}
              {[...marks].sort((a, b) => b.ts - a.ts).map((m) => {
                const r = reactById(m.reaction);
                return (
                  <div key={m.id} className="bg-bg border border-bdr rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-accent">{r.sym}</span>
                      <span className="text-[11px] text-muted">{r.label}</span>
                      <button onClick={() => removeMark(m.id)} className="ml-auto text-muted hover:text-terra bg-transparent border-none cursor-pointer text-xs"><i className="fas fa-trash" /></button>
                    </div>
                    <p className="font-serif text-sm text-fg leading-snug italic">“{m.text}”</p>
                    {m.note && <p className="text-xs text-muted mt-1.5">{m.note}</p>}
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => { setAi({ mode: "quiz", passage: m.text }); setDrawer(false); }} className="text-[11px] text-accent hover:underline bg-transparent border-none cursor-pointer p-0">
                        <i className="fas fa-circle-question mr-1" />Quiz me
                      </button>
                      {onSendToDeepRead && (
                        <button onClick={() => { onSendToDeepRead(m.text); setDrawer(false); }} className="text-[11px] text-sage hover:underline bg-transparent border-none cursor-pointer p-0">
                          <i className="fas fa-layer-group mr-1" />Think on this
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {ai && (
        <ReaderAI book={book} mode={ai.mode} passage={ai.passage} onClose={() => setAi(null)} onMakeNote={saveAsNote} />
      )}
    </div>
  );
}
