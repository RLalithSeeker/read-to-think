"use client";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";
import { extCl } from "@/lib/deepread";

function stanceLabel(v) {
  v = parseInt(v);
  if (v < 25) return { text: "Strongly Disagree", cls: "text-terra" };
  if (v < 40) return { text: "Lean Disagree", cls: "text-terra/70" };
  if (v < 60) return { text: "Undecided", cls: "text-muted" };
  if (v < 75) return { text: "Lean Agree", cls: "text-sage/70" };
  return { text: "Strongly Agree", cls: "text-sage" };
}

export default function DeepRead({ drS, setDrS, onHome }) {
  const { addNote, toast } = useApp();
  const [pasteText, setPasteText] = useState("");
  const bodyRef = useRef(null);

  const scrollTop = () => { if (bodyRef.current) bodyRef.current.scrollTop = 0; };
  useEffect(scrollTop, [drS.step, drS.idx]);

  const drGo = (step) => setDrS((s) => ({ ...s, step }));
  const setField = (field, idx, val) => setDrS((s) => ({ ...s, [field]: { ...s[field], [idx]: val } }));

  function procText() {
    const t = pasteText.trim();
    if (t.length < 100) return;
    const claims = extCl(t);
    if (!claims.length) { toast("Could not extract claims. Try a longer passage."); return; }
    setDrS((s) => ({ ...s, title: "Your Text", claims, step: "claims" }));
  }

  function drBack() {
    const st = ["input", "claims", "think", "collect"];
    const i = st.indexOf(drS.step);
    if (i > 0) drGo(st[i - 1]); else onHome();
  }

  function beginThink() {
    let si = 0;
    for (let i = 0; i < drS.claims.length; i++) {
      if (!drS.an[i]) { si = i; break; }
      if (i === drS.claims.length - 1) si = 0;
    }
    setDrS((s) => ({ ...s, idx: si, step: "think" }));
  }

  function revR(idx) {
    const v = (drS.ref[idx] || "").trim();
    if (v.length < 10) { toast("Write at least a sentence first. The friction is the point."); return; }
    setDrS((s) => ({ ...s, rev: { ...s.rev, [idx]: true } }));
  }

  function prevCl() { if (drS.idx > 0) setDrS((s) => ({ ...s, idx: s.idx - 1 })); }

  function saveNC(idx) {
    const an = (drS.an[idx] || "").trim();
    if (!an) { toast("Write your atomic note first."); return; }
    setDrS((s) => {
      const notes = s.notes.slice();
      const exist = notes.findIndex((n) => n.ci === idx);
      let isNew = false;
      if (exist >= 0) { notes[exist] = { ...notes[exist], note: an, st: s.st[idx] ?? 50 }; }
      else { notes.push({ id: notes.length + 1, ci: idx, claim: s.claims[idx].text, note: an, st: s.st[idx] ?? 50 }); isNew = true; }
      if (isNew) addNote({ content: an, book: s.title || "Deep Read", ts: Date.now(), type: "dr" });
      const next = { ...s, notes };
      if (idx + 1 < s.claims.length) next.idx = idx + 1;
      else next.step = "collect";
      return next;
    });
  }

  // ---------- render ----------
  return (
    <div ref={bodyRef} className="flex-1 overflow-y-auto">
      {drS.step === "input" && (
        <div className="max-w-2xl mx-auto px-6 py-12">
          <h2 className="serif text-2xl font-bold mb-2">Paste a passage to think through</h2>
          <p className="text-muted mb-6 text-sm">We will extract claims for you to wrestle with.</p>
          <textarea className="dr-ta" rows={10} placeholder="Paste your text here..." value={pasteText} onChange={(e) => setPasteText(e.target.value)} />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted">{pasteText.trim().length} characters</span>
            <button onClick={procText} className="bm" disabled={pasteText.trim().length < 100}>Extract Claims <i className="fas fa-arrow-right ml-2 text-sm" /></button>
          </div>
        </div>
      )}

      {drS.step === "claims" && (
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="serif text-2xl font-bold mb-2">Claims to Think Through</h2>
            <p className="text-muted text-sm">We will go through these one by one.</p>
          </div>
          <div className="space-y-3 mb-8">
            {drS.claims.map((cl, i) => {
              const dn = !!drS.an[i];
              return (
                <div key={i} className={"cr anim-up" + (dn ? " done" : "")} style={{ animationDelay: i * 0.06 + "s" }}>
                  <div className="flex items-start gap-3">
                    <span className={"flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 " + (dn ? "bg-sage/20 text-sage" : "bg-bdr text-muted")}>
                      {dn ? <i className="fas fa-check text-[10px]" /> : i + 1}
                    </span>
                    <p className={"text-sm leading-relaxed " + (dn ? "text-muted" : "text-fg")}>{cl.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center">
            <button onClick={drBack} className="bs text-sm"><i className="fas fa-arrow-left mr-2" />Back</button>
            <button onClick={beginThink} className="bm">Begin Thinking <i className="fas fa-arrow-right ml-2 text-sm" /></button>
          </div>
        </div>
      )}

      {drS.step === "think" && (() => {
        const i = drS.idx;
        const cl = drS.claims[i];
        if (!cl) return null;
        const iR = !!drS.rev[i];
        const hR = drS.ref[i] !== undefined && drS.ref[i] !== "";
        const hS = drS.st[i] !== undefined;
        const hN = !!(drS.an[i] && drS.an[i].trim());
        const sv = drS.st[i] ?? 50;
        const sl = stanceLabel(sv);
        const lockCls = iR ? "" : "opacity-30 pointer-events-none";
        return (
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="anim-up">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs text-muted tracking-wider uppercase">Claim {i + 1} of {drS.claims.length}</span>
                <div className="flex-1 h-px bg-bdr" />
              </div>
              <div className="bg-card border border-bdr-l rounded-xl p-6 mb-8">
                <p className="serif text-lg md:text-xl leading-relaxed text-fg">&quot;{cl.text}&quot;</p>
              </div>

              {/* Phase 1 — Think First */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center"><span className="text-accent text-[10px] font-bold">1</span></div>
                  <h3 className="font-semibold text-sm text-fg">Think First</h3>
                  {hR && <span className="text-sage text-xs ml-auto"><i className="fas fa-check mr-1" />Done</span>}
                </div>
                <p className="text-muted text-sm mb-3 ml-7">Before seeing what the author means, write what <span className="text-fg font-medium">you</span> believe.</p>
                <div className="ml-7">
                  <textarea className="dr-ta" rows={4} placeholder="I think that..." value={drS.ref[i] || ""} onChange={(e) => setField("ref", i, e.target.value)} />
                </div>
              </div>

              <div className="ml-7 mb-8">
                <button onClick={() => revR(i)} disabled={iR} className={(iR ? "opacity-50 cursor-default " : "") + "flex items-center gap-2 text-accent hover:text-accent-h transition-colors text-sm font-medium bg-transparent border-none cursor-pointer font-[inherit]"}>
                  <i className={"fas " + (iR ? "fa-eye" : "fa-eye-slash")} />
                  {iR ? "Author's reasoning revealed" : "Reveal Author's Reasoning"}
                  {!iR && <i className="fas fa-arrow-right text-xs" />}
                </button>
              </div>

              <div className={"reasoning-box " + (iR ? "open " : "") + "mb-8"}>
                <div className="ml-7 bg-[#141412] border border-bdr rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fas fa-book-open text-accent text-sm" />
                    <span className="text-xs text-accent tracking-wider uppercase font-medium">Author&apos;s Reasoning</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">{cl.reasoning}</p>
                  {cl.fq && <p className="text-sm text-fg/60 mt-3 italic">{cl.fq}</p>}
                </div>
              </div>

              {/* Phase 2 — Stance */}
              <div className={lockCls + " mb-8 transition-opacity duration-500"}>
                <div className="flex items-center gap-2 mb-3 ml-7">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center"><span className="text-accent text-[10px] font-bold">2</span></div>
                  <h3 className="font-semibold text-sm text-fg">Where Do You Stand?</h3>
                  {hS && <span className="text-sage text-xs ml-auto"><i className="fas fa-check mr-1" />Done</span>}
                </div>
                <div className="ml-7">
                  <div className="mb-4">
                    <input type="range" min={0} max={100} value={sv} onChange={(e) => setField("st", i, parseInt(e.target.value))} />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-terra">Strongly Disagree</span>
                      <span className={"text-xs font-medium " + sl.cls}>{sl.text}</span>
                      <span className="text-xs text-sage">Strongly Agree</span>
                    </div>
                  </div>
                  <textarea className="dr-ta" rows={3} placeholder="Why? Be specific." value={drS.stx[i] || ""} onChange={(e) => setField("stx", i, e.target.value)} />
                </div>
              </div>

              {/* Phase 3 — Atomic Note */}
              <div className={lockCls + " mb-10 transition-opacity duration-500"}>
                <div className="flex items-center gap-2 mb-3 ml-7">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center"><span className="text-accent text-[10px] font-bold">3</span></div>
                  <h3 className="font-semibold text-sm text-fg">Your Atomic Note</h3>
                  {hN && <span className="text-sage text-xs ml-auto"><i className="fas fa-check mr-1" />Saved</span>}
                </div>
                <p className="text-muted text-sm mb-3 ml-7">Write <span className="text-fg font-medium">one insight</span> in your own words. Not a summary.</p>
                <div className="ml-7">
                  <textarea className="dr-ta" rows={4} placeholder="The key insight for me is..." value={drS.an[i] || ""} onChange={(e) => setField("an", i, e.target.value)} />
                </div>
              </div>

              <div className="flex justify-between items-center ml-7">
                {i > 0 ? (
                  <button onClick={prevCl} className="bs text-sm"><i className="fas fa-arrow-left mr-2" />Previous</button>
                ) : <div />}
                <button onClick={() => saveNC(i)} className="bm">{hN ? "Update & Continue" : "Save Note & Continue"} <i className="fas fa-arrow-right ml-2 text-sm" /></button>
              </div>
            </div>
          </div>
        );
      })()}

      {drS.step === "collect" && (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8 text-center">
            <div className="text-accent text-3xl mb-3"><i className="fas fa-feather-pointed" /></div>
            <h2 className="serif text-3xl font-bold mb-2">Your Thinking, Not a Summary</h2>
            <p className="text-muted max-w-lg mx-auto text-sm">Atomic notes capturing what changed in you.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {!drS.notes.length ? (
              <p className="text-muted text-center py-12 col-span-2">No notes.</p>
            ) : (
              drS.notes.map((n, i) => {
                const sc = n.st < 35 ? "text-terra" : n.st > 65 ? "text-sage" : "text-accent";
                const sw = n.st < 25 ? "Strongly Disagree" : n.st < 40 ? "Lean Disagree" : n.st < 60 ? "Undecided" : n.st < 75 ? "Lean Agree" : "Strongly Agree";
                return (
                  <div key={i} className="nc anim-up" style={{ animationDelay: i * 0.08 + "s" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted">#{n.id}</span>
                      <span className={"text-xs font-medium " + sc}>{sw}</span>
                    </div>
                    <p className="text-fg text-sm leading-relaxed mb-4">{n.note}</p>
                    <div className="border-t border-bdr pt-3">
                      <p className="text-xs text-muted/60 italic">{n.claim.substring(0, 80)}{n.claim.length > 80 ? "..." : ""}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="text-center">
            <button onClick={onHome} className="bs"><i className="fas fa-rotate-left mr-2" />Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
}
