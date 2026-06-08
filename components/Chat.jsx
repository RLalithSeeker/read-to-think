"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/lib/store";
import { cSP } from "@/lib/deepread";
import { F } from "@/lib/format";

let MID = 0;

// Canned example conversation so new users understand the Socratic style
// WITHOUT needing an API key. Loaded read-only, clearly labelled as a demo.
const DEMO_CONV = [
  { role: "user", content: "I just read the chapter on System 1 and System 2 in Thinking, Fast and Slow. I learned that System 1 is fast and intuitive and System 2 is slow and logical." },
  { role: "assistant", content: "That's the textbook label — but notice you just *restated* Kahneman's vocabulary. Let me push: can you give me a moment from **your own day** where System 1 gave you an answer that System 2 would have rejected? If you can't, you recognised the idea but haven't reconstructed it yet." },
  { role: "user", content: "Hmm. This morning I assumed a long email was urgent just because it was long, and replied first — but it wasn't urgent at all." },
  { role: "assistant", content: "Good — now you're thinking, not summarising. So what *rule* did System 1 secretly use there? Not \"length means urgent\" — say it as a bias you could catch next time. And here's the harder question: does knowing the name \"System 1\" actually help you stop it, or does it just make you *feel* like you understand your own mind?" },
];

function gQA(cBk, cMsgs) {
  const bk = cBk;
  const has = cMsgs.length > 0;
  let lu = null;
  for (let i = cMsgs.length - 1; i >= 0; i--) { if (cMsgs[i].role === "user") { lu = cMsgs[i]; break; } }
  const sh = lu && lu.content.length > 80;
  if (!bk && !has) return [
    { l: "Help me choose a book", i: "fa-compass", p: "I want to read something that will genuinely challenge my current thinking. Can you ask me a few questions to figure out what I should read next?" },
    { l: "I know what I am reading", i: "fa-book", a: "focus" },
  ];
  if (!bk && has) return [
    { l: "Suggest a book", i: "fa-compass", p: "Based on what we discussed, what book should I read next? Explain why it would create productive friction with my thinking." },
  ];
  if (sh) return [
    { l: "What did I miss?", i: "fa-magnifying-glass", p: "Based on what I shared about this chapter, are there key points or nuances I missed or glossed over? Be specific." },
    { l: "Did I understand correctly?", i: "fa-scale-balanced", p: "Compare what I said I learned with what the author actually intended. Where does my understanding differ?" },
    { l: "Write an atomic note", i: "fa-pen-nib", p: "Help me write one atomic note about what actually changed in my thinking. Not a summary." },
  ];
  return [
    { l: "I just finished a chapter", i: "fa-book-open", a: "focus" },
    { l: "What should I focus on?", i: "fa-crosshairs", p: "What should I pay special attention to in this book? What do readers most commonly misunderstand?" },
    { l: "Am I reading this right?", i: "fa-route", p: "Am I approaching this book correctly? What is the most common mistake readers make with this kind of book?" },
  ];
}

export default function Chat() {
  const { cfg, addNote, toast, setSettingsOpen } = useApp();
  const [cMsgs, setCMsgs] = useState([]);
  const [cBk, setCBk] = useState("");
  const [cStr, setCStr] = useState(false);
  const [input, setInput] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const ctrlRef = useRef(null);
  const scRef = useRef(null);
  const inRef = useRef(null);

  useEffect(() => {
    try { const sb = localStorage.getItem("rt_bk"); if (sb) setCBk(sb); } catch (e) {}
  }, []);

  const scrollBottom = useCallback(() => {
    const a = scRef.current;
    if (a) requestAnimationFrame(() => a.scrollTo({ top: a.scrollHeight, behavior: "smooth" }));
  }, []);
  useEffect(scrollBottom, [cMsgs, scrollBottom]);

  function setBook(v) {
    setCBk(v);
    try { localStorage.setItem("rt_bk", v); } catch (e) {}
  }

  function autosize(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  }

  function loadDemo() {
    setIsDemo(true);
    setCMsgs(DEMO_CONV.map((m, i) => ({ ...m, id: -(i + 1) })));
  }
  function exitDemo() {
    setIsDemo(false);
    setCMsgs([]);
  }

  function fireQA(idx) {
    const a = gQA(cBk, cMsgs)[idx];
    if (!a) return;
    if (a.a === "focus") { inRef.current && inRef.current.focus(); return; }
    if (a.p) { setInput(a.p); requestAnimationFrame(() => { autosize(inRef.current); inRef.current && inRef.current.focus(); }); }
  }

  async function doStream(history) {
    setCStr(true);
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    const am = [{ role: "system", content: cSP(cBk) }, ...history.map((m) => ({ role: m.role, content: m.content }))];
    const aid = ++MID;
    setCMsgs((prev) => [...prev, { role: "assistant", content: "", id: aid }]);

    const setAi = (updater) => setCMsgs((prev) => prev.map((m) => (m.id === aid ? { ...m, content: updater(m.content) } : m)));

    try {
      const res = await fetch(cfg.url.replace(/\/+$/, "") + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.key },
        body: JSON.stringify({ model: cfg.model, messages: am, stream: true, temperature: 0.7, max_tokens: 2048 }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        let msg;
        try { const ed = await res.json(); msg = (ed.error && ed.error.message) || "Error"; }
        catch (e) { msg = res.status === 401 ? "Invalid API key. Click gear icon." : "Something went wrong."; }
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const r = await reader.read();
        if (r.done) break;
        buf += dec.decode(r.value, { stream: true });
        const ls = buf.split("\n");
        buf = ls.pop() || "";
        for (const raw of ls) {
          const ln = raw.trim();
          if (ln.indexOf("data: ") !== 0) continue;
          const d = ln.slice(6);
          if (d === "[DONE]") continue;
          try {
            const p = JSON.parse(d);
            const delta = p.choices && p.choices[0] && p.choices[0].delta && p.choices[0].delta.content;
            if (delta) { setAi((c) => c + delta); scrollBottom(); }
          } catch (e) {}
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setAi((c) => c || "(Stopped)");
      } else {
        const m = err.message || "Something went wrong.";
        setCMsgs((prev) => prev.map((x) => (x.id === aid ? { ...x, content: "", error: m } : x)));
      }
    } finally {
      setCStr(false);
      ctrlRef.current = null;
      scrollBottom();
    }
  }

  function sendMsg() {
    const txt = input.trim();
    if (!txt || cStr) return;
    if (!cfg.key) { setSettingsOpen(true); toast("Set your API key first."); return; }
    const um = { role: "user", content: txt, id: ++MID };
    const base = isDemo ? [] : cMsgs; // drop the read-only demo before a real chat
    if (isDemo) setIsDemo(false);
    const history = [...base, um];
    setCMsgs(history);
    setInput("");
    requestAnimationFrame(() => autosize(inRef.current));
    doStream(history);
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (cStr) { if (ctrlRef.current) ctrlRef.current.abort(); }
      else sendMsg();
    }
  }

  function copyMsg(id) {
    const m = cMsgs.find((x) => x.id === id);
    if (m) navigator.clipboard.writeText(m.content).then(() => toast("Copied."));
  }
  function saveMsg(id) {
    const m = cMsgs.find((x) => x.id === id);
    if (!m) return;
    addNote({ mid: id, content: m.content, book: cBk || "Chat", ts: Date.now(), type: "chat" });
    toast("Saved.");
  }

  const acts = gQA(cBk, cMsgs);
  const showBar = cMsgs.length > 0 || !!cBk;
  const showWelcome = cMsgs.length === 0;

  return (
    <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
      <div className="flex-shrink-0 px-4 md:px-6 pt-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <i className="fas fa-book text-accent/50 text-[10px]" />
          <input type="text" className="bi" placeholder="Set your book..." value={cBk} onChange={(e) => setBook(e.target.value.trimStart())} onBlur={(e) => setBook(e.target.value.trim())} />
        </div>
      </div>

      <div ref={scRef} className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 anim-up"><i className="fas fa-brain text-accent text-xl" /></div>
            <h2 className="serif text-2xl md:text-3xl font-bold mb-3 anim-up" style={{ animationDelay: ".08s" }}>AI Socratic Companion</h2>
            <p className="text-muted max-w-md mb-8 leading-relaxed text-sm md:text-base anim-up" style={{ animationDelay: ".15s" }}>I will not summarize your book. I will challenge your reading and force you to think harder.</p>
            <div className="flex flex-wrap justify-center gap-3 anim-up" style={{ animationDelay: ".22s" }}>
              {acts.map((a, i) => (
                <button key={i} onClick={() => fireQA(i)} className="qc flex items-center gap-2"><i className={"fas " + a.i + " text-accent/60 text-[10px]"} />{a.l}</button>
              ))}
            </div>
            <button onClick={loadDemo} className="mt-6 text-sm text-muted hover:text-accent transition-colors bg-transparent border-none cursor-pointer font-[inherit] anim-up" style={{ animationDelay: ".3s" }}>
              <i className="fas fa-wand-magic-sparkles mr-1.5 text-xs" />See how it works — no key needed
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">
            {isDemo && (
              <div className="flex items-center justify-between gap-3 bg-accent/[0.06] border border-accent/20 rounded-xl px-4 py-2.5 anim-up">
                <span className="text-xs text-accent"><i className="fas fa-wand-magic-sparkles mr-1.5" />Example conversation — set your key and type to start a real one.</span>
                <button onClick={exitDemo} className="text-xs text-muted hover:text-fg transition-colors bg-transparent border-none cursor-pointer font-[inherit] whitespace-nowrap">Clear</button>
              </div>
            )}
            {cMsgs.map((m) => {
              const isU = m.role === "user";
              if (isU) {
                return (
                  <div key={m.id} className="mw anim-up flex justify-end">
                    <div className="max-w-[85%] md:max-w-[70%]">
                      <div className="bg-accent/[0.08] border border-accent/20 rounded-2xl rounded-br-md px-4 py-3">
                        <p className="text-sm leading-relaxed text-fg whitespace-pre-wrap">{m.content}</p>
                      </div>
                    </div>
                  </div>
                );
              }
              const loading = cStr && !m.content && !m.error;
              const done = !cStr && (m.content || m.error);
              return (
                <div key={m.id} className="mw anim-up flex justify-start">
                  <div className="max-w-[90%] md:max-w-[80%] flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-card border border-bdr flex items-center justify-center flex-shrink-0 mt-0.5"><i className="fas fa-brain text-accent text-[10px]" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="border-l-2 border-accent/20 pl-4 py-0.5">
                        {m.error ? (
                          <div className="cmsg text-sm leading-relaxed text-fg/85">
                            <div className="flex items-start gap-2 text-terra text-sm"><i className="fas fa-circle-exclamation mt-0.5" /><span>{m.error}</span></div>
                            {m.error.indexOf("API key") !== -1 && (
                              <button onClick={() => setSettingsOpen(true)} className="text-accent text-xs underline mt-2 block cursor-pointer bg-transparent border-none font-[inherit]">Open Settings</button>
                            )}
                          </div>
                        ) : loading ? (
                          <div className="cmsg text-sm leading-relaxed text-fg/85"><div className="dots py-2"><span /> <span /> <span /></div></div>
                        ) : (
                          <div className="cmsg text-sm leading-relaxed text-fg/85" dangerouslySetInnerHTML={{ __html: F(m.content) }} />
                        )}
                      </div>
                      <div className="mha flex items-center gap-1 mt-1.5 ml-5">
                        {done && m.content && (
                          <>
                            <button onClick={() => copyMsg(m.id)} className="text-[11px] text-muted/40 hover:text-muted px-2 py-1 rounded transition-colors cursor-pointer bg-transparent border-none font-[inherit]"><i className="fas fa-copy mr-1" />Copy</button>
                            <button onClick={() => saveMsg(m.id)} className="text-[11px] text-muted/40 hover:text-accent px-2 py-1 rounded transition-colors cursor-pointer bg-transparent border-none font-[inherit]"><i className="fas fa-bookmark mr-1" />Save</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showBar && (
        <div className="flex-shrink-0 px-4 md:px-6 pb-2">
          <div className="flex flex-wrap gap-2 max-w-3xl mx-auto">
            {acts.map((a, i) => (
              <button key={i} onClick={() => fireQA(i)} className="qc flex items-center gap-1.5"><i className={"fas " + a.i + " text-accent/60 text-[10px]"} />{a.l}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-shrink-0 px-4 md:px-6 pb-4 pt-1">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-[#141412] border border-bdr rounded-2xl p-2 transition-colors focus-within:border-accent/40">
            <textarea
              ref={inRef}
              className="ct flex-1 p-2"
              placeholder="Share what you learned from this chapter..."
              rows={1}
              value={input}
              onChange={(e) => { setInput(e.target.value); autosize(e.target); }}
              onKeyDown={onKey}
            />
            <button
              onClick={() => { if (cStr) { if (ctrlRef.current) ctrlRef.current.abort(); } else sendMsg(); }}
              disabled={!cStr && !input.trim()}
              className="w-10 h-10 rounded-xl text-bg flex items-center justify-center flex-shrink-0 transition-all hover:brightness-110 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer border-none"
              style={{ background: cStr ? "#B07060" : "#C8965A" }}
            >
              <i className={"fas " + (cStr ? "fa-stop" : "fa-arrow-up") + " text-sm"} />
            </button>
          </div>
          <p className="text-[10px] text-muted/30 text-center mt-2">Never summarizes. Built on Adler, Luhmann, and cognitive science.</p>
        </div>
      </div>
    </div>
  );
}
