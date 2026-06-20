"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/lib/store";
import { analyzeFluency } from "@/lib/fluency";
import { F } from "@/lib/format";

// Phase 2 — AI sees the passage, NEVER the whole book, and NEVER summarizes.
// Two scoped flows: Socratic dialogue + Quiz-me (active recall, fused with the
// local fluency heuristic). Browser-direct, BYO key (spec §9.9 — key never leaves browser).

const SOCRATIC_SYS =
  "You are a Socratic reading companion looking at ONE passage the reader selected. " +
  "Absolute rules: NEVER summarize, paraphrase, or explain the passage back. NEVER restate its content. " +
  "Your only move is to ask sharp questions that force the reader to reconstruct the idea in THEIR OWN words, " +
  "connect it to their own experience, or defend/attack it. One or two questions per turn. " +
  "If the reader just parrots the passage's vocabulary, call it out and push for a concrete example from their life. " +
  "Be terse and warm. No false encouragement.";

const QGEN_SYS =
  "You look at ONE passage. Write exactly ONE question that forces the reader to reconstruct the core idea from memory " +
  "in their own words — not recall a fact, not match a phrase. NEVER summarize the passage. NEVER reveal the answer. " +
  "Output only the question, one sentence.";

const JUDGE_SYS =
  "You judge whether a reader's answer RECONSTRUCTS an idea in their OWN words or just PARROTS the passage's vocabulary " +
  "(recognition, not understanding). Be terse — at most 2 sentences. If they parroted, name one specific borrowed word/phrase to rephrase. " +
  "End with a final line exactly: VERDICT: OWN WORDS | PARTLY PARROTED | PARROTED";

export default function ReaderAI({ book, passage, mode, onClose, onMakeNote }) {
  const { cfg, setSettingsOpen, toast } = useApp();
  const [msgs, setMsgs] = useState([]);        // socratic: {role,content,id}
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // quiz
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState(null); // { text, fluency }
  const ctrlRef = useRef(null);
  const scRef = useRef(null);
  const idRef = useRef(0);

  const ready = () => {
    if (!cfg.key) { setSettingsOpen(true); toast("Set your API key first."); return false; }
    return true;
  };

  const scrollBottom = useCallback(() => {
    const a = scRef.current;
    if (a) requestAnimationFrame(() => a.scrollTo({ top: a.scrollHeight, behavior: "smooth" }));
  }, []);
  useEffect(scrollBottom, [msgs, verdict, q, scrollBottom]);

  // non-streaming completion
  async function complete(messages, temperature = 0.4, max_tokens = 300) {
    const res = await fetch(cfg.url.replace(/\/+$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.key },
      body: JSON.stringify({ model: cfg.model, messages, temperature, max_tokens }),
    });
    if (!res.ok) throw new Error(res.status === 401 ? "Invalid API key. Open settings." : "Request failed.");
    const data = await res.json();
    return ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "").trim();
  }

  // ---- Quiz flow ----
  useEffect(() => {
    if (mode !== "quiz") return;
    if (!ready()) { onClose(); return; }
    setBusy(true);
    complete([{ role: "system", content: QGEN_SYS }, { role: "user", content: passage }], 0.6, 120)
      .then((text) => setQ(text || "What is the core idea here — in your own words?"))
      .catch((e) => { toast(e.message); setQ("What is the core idea here — in your own words?"); })
      .finally(() => setBusy(false));
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  async function judge() {
    if (!answer.trim()) { toast("Answer from memory first."); return; }
    if (!ready()) return;
    setBusy(true);
    const fluency = analyzeFluency(answer, passage);
    try {
      const text = await complete([
        { role: "system", content: JUDGE_SYS },
        { role: "user", content: "PASSAGE:\n" + passage + "\n\nQUESTION:\n" + q + "\n\nMY ANSWER:\n" + answer },
      ], 0.3, 220);
      setVerdict({ text, fluency });
    } catch (e) { toast(e.message); setVerdict({ text: "(judge unavailable)", fluency }); }
    finally { setBusy(false); }
  }

  // ---- Socratic flow ----
  async function send(text) {
    const t = (text == null ? input : text).trim();
    if (!t || busy) return;
    if (!ready()) return;
    setInput("");
    const uid = ++idRef.current;
    const history = [...msgs, { role: "user", content: t, id: uid }];
    setMsgs(history);
    setBusy(true);
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const aid = ++idRef.current;
    setMsgs((p) => [...p, { role: "assistant", content: "", id: aid }]);
    const setAi = (fn) => setMsgs((p) => p.map((m) => (m.id === aid ? { ...m, content: fn(m.content) } : m)));
    try {
      const am = [
        { role: "system", content: SOCRATIC_SYS + "\n\nPASSAGE:\n" + passage },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ];
      const res = await fetch(cfg.url.replace(/\/+$/, "") + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.key },
        body: JSON.stringify({ model: cfg.model, messages: am, stream: true, temperature: 0.7, max_tokens: 700 }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(res.status === 401 ? "Invalid API key. Open settings." : "Request failed.");
      const rd = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const r = await rd.read();
        if (r.done) break;
        buf += dec.decode(r.value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          const s = line.trim();
          if (!s.startsWith("data:")) continue;
          const d = s.slice(5).trim();
          if (d === "[DONE]") continue;
          try { const j = JSON.parse(d); const dt = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content; if (dt) setAi((c) => c + dt); } catch (e) {}
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") setAi(() => "_Error: " + e.message + "_");
    } finally { setBusy(false); ctrlRef.current = null; }
  }

  // kick off socratic with an opening question about the passage
  useEffect(() => {
    if (mode !== "socratic") return;
    if (!ready()) { onClose(); return; }
    send("(I just read this passage. Open with one Socratic question — do not summarize it.)");
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const vline = verdict && /VERDICT:\s*(OWN WORDS|PARTLY PARROTED|PARROTED)/i.exec(verdict.text);
  const vtag = vline ? vline[1].toUpperCase() : null;
  const vcolor = vtag === "OWN WORDS" ? "text-sage" : vtag === "PARROTED" ? "text-terra" : "text-accent";
  const vbody = verdict ? verdict.text.replace(/\n?VERDICT:.*/i, "").trim() : "";

  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg bg-card border border-bdr rounded-t-2xl sm:rounded-2xl flex flex-col anim-up"
        style={{ maxHeight: "85dvh" }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-bdr flex-shrink-0">
          <i className={"fas " + (mode === "quiz" ? "fa-circle-question text-accent" : "fa-comments text-sage")} />
          <span className="font-serif text-fg text-sm">{mode === "quiz" ? "Quiz me" : "Think it through"}</span>
          <span className="text-[11px] text-muted ml-1">· passage only, never the whole book</span>
          <button onClick={onClose} className="ml-auto text-muted hover:text-fg bg-transparent border-none cursor-pointer"><i className="fas fa-xmark" /></button>
        </div>

        <div ref={scRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          <div className="text-[11px] text-muted italic border-l-2 border-bdr pl-3 mb-4 line-clamp-3">“{passage}”</div>

          {mode === "quiz" ? (
            <div>
              <div className="bg-bg border border-bdr rounded-xl p-3 mb-3">
                <div className="text-[11px] text-accent mb-1 font-medium">Answer from memory — don't scroll back.</div>
                <p className="font-serif text-fg text-[0.95rem] leading-relaxed">{q || (busy ? "…" : "")}</p>
              </div>
              {!verdict && (
                <>
                  <textarea autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Reconstruct the idea in your own words…"
                    className="w-full h-28 bg-bg border border-bdr rounded-lg px-3 py-2 text-sm text-fg outline-none focus:border-accent resize-none font-serif leading-relaxed" />
                  <button onClick={judge} disabled={busy}
                    className="mt-2 px-4 py-2.5 rounded-lg bg-accent text-bg text-sm font-medium border-none cursor-pointer min-h-[44px] disabled:opacity-50">
                    {busy ? "Checking…" : "Check my reconstruction"}
                  </button>
                </>
              )}
              {verdict && (
                <div className="anim-up">
                  <p className="font-serif text-fg text-sm leading-relaxed mb-2 italic">“{answer}”</p>
                  {vtag && <div className={"text-xs font-bold mb-1 " + vcolor}>VERDICT: {vtag}</div>}
                  <p className="text-sm text-fg leading-relaxed">{vbody}</p>
                  {verdict.fluency && verdict.fluency.borrowed.length > 0 && (
                    <div className="mt-2 text-[11px] text-muted">
                      Borrowed from the text: {verdict.fluency.borrowed.map((w) => (
                        <span key={w} className="inline-block bg-terra/15 text-terra rounded px-1.5 py-0.5 mr-1 mb-1">{w}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    {onMakeNote && (
                      <button onClick={() => { onMakeNote(answer); toast("Saved as a note."); }} className="px-3 py-2 rounded-lg bg-bg border border-bdr text-fg text-xs cursor-pointer">
                        <i className="fas fa-pen-nib mr-1" />Save my answer as a note
                      </button>
                    )}
                    <button onClick={() => { setVerdict(null); setAnswer(""); }} className="px-3 py-2 text-muted text-xs bg-transparent border-none cursor-pointer">Try again</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {msgs.filter((m) => m.role !== "user" || !/^\(I just read/.test(m.content)).map((m) => (
                <div key={m.id} className={m.role === "user" ? "self-end max-w-[85%]" : "self-start max-w-[90%]"}>
                  <div className={m.role === "user"
                    ? "bg-accent/15 rounded-xl rounded-br-sm px-3 py-2 text-sm text-fg"
                    : "text-fg text-sm leading-relaxed"}>
                    {m.role === "assistant"
                      ? <span dangerouslySetInnerHTML={{ __html: F(m.content) || (busy ? "…" : "") }} />
                      : m.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {mode === "socratic" && (
          <div className="border-t border-bdr p-3 flex-shrink-0" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Answer in your own words…"
                className="flex-1 bg-bg border border-bdr rounded-lg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent" />
              <button onClick={() => send()} disabled={busy} className="px-4 rounded-lg bg-accent text-bg text-sm font-medium border-none cursor-pointer min-h-[44px] disabled:opacity-50">
                <i className="fas fa-arrow-up" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
