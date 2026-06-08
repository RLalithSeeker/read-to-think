// Ported 1:1 from readtothink.html — demo claims + heuristic claim extraction.

export const demoCl = [
  { text: "There is a fundamental difference between being familiar with an author's words and understanding their ideas.", reasoning: "Familiarity means you can recognize something when you see it again. Understanding means you could explain it to someone else, apply it in a new context, or spot when it is being misused. These are completely different cognitive operations.", fq: "Think of something you are familiar with. Could you teach it from scratch without any reference?" },
  { text: "Highlighting and re-reading create passive recognition, not active understanding.", reasoning: "Research by Rozenblit & Keil at Yale shows that people consistently overestimate how well they understand complex phenomena. Re-reading strengthens recognition without strengthening the ability to reconstruct or apply the idea.", fq: "Have you ever re-read notes and felt like you knew them, then blanked when asked to explain?" },
  { text: "Summarizing a book is often worse than useless because it creates the illusion that you absorbed the content.", reasoning: "When you summarize, you compress the author's ideas using the author's own framework. You have not translated the idea into your mental models, you have just made it smaller. Worse, writing the summary gives you a dopamine hit of productivity that makes you LESS likely to revisit the ideas.", fq: "Look at your last book summary notes. Are they in your words, or a compressed version of the author?" },
  { text: "The real question is not what does this book say but what does this book do to what I already believe?", reasoning: "This is Adler's core insight. Information transfer is the lowest level of reading. The highest level is about placing the book in conversation with your existing knowledge and watching what shifts.", fq: "What is the last book that actually changed your mind about something? Not added information but changed a belief." },
  { text: "Luhmann's system did not store information, it generated thinking.", reasoning: "His Zettelkasten had a crucial design constraint: every note had to be in his own words, standalone, and linked to at least one other note. This forced translation, connection, and contextualization. The value was not retrieval, it was the thinking each note required.", fq: "If your note-taking system disappeared tomorrow, would you have lost knowledge, or just the thinking you did while writing?" },
  { text: "A book has done its work only when it has changed something in you.", reasoning: "This redefines reading from consumption to transformation. Most reading is confirmatory. But Adler argues the purpose is to be confronted with ideas that create productive friction with your existing mental models.", fq: "Do you gravitate toward books that confirm your views or challenge them? Be honest." },
];

export function extCl(text) {
  const ss = text.match(/[^.!?]+[.!?]+/g) || [];
  const sig = ["argues", "asserts", "suggests", "shows", "proves", "means", "therefore", "because", "however", "fundamental", "crucial", "important", "difference", "requires", "should", "must", "never", "always", "only", "not", "worse than", "enemy", "purpose", "real question"];
  const sc = [];
  for (let i = 0; i < ss.length; i++) {
    const s = ss[i];
    let score = 0;
    const lo = s.toLowerCase().trim();
    const w = lo.split(/\s+/).length;
    if (w >= 10 && w <= 40) score += 3;
    else if (w > 40) score += 1;
    else score -= 2;
    for (let j = 0; j < sig.length; j++) { if (lo.indexOf(sig[j]) !== -1) score += 1.5; }
    if (s.indexOf("?") === -1) score += 1; else score -= 1;
    if (s.indexOf(",") !== -1 || s.indexOf(";") !== -1) score += 0.5;
    sc.push({ text: s.trim(), score: Math.max(score, 0) });
  }
  sc.sort((a, b) => b.score - a.score);
  const res = [];
  const cnt = Math.min(6, sc.length);
  for (let k = 0; k < cnt; k++) {
    const it = sc[k];
    const ix = text.indexOf(it.text);
    let cx = "";
    if (ix !== -1) {
      const st = Math.max(0, ix - 150);
      const en = Math.min(text.length, ix + it.text.length + 150);
      cx = text.slice(st, en).replace(it.text, "...");
    }
    res.push({ id: k, text: it.text, reasoning: cx ? 'Context: "' + cx.trim() + '"' : "Consider what the author means and why.", fq: "What do you already believe about this?" });
  }
  return res;
}

export function cSP(cBk) {
  let p = "You are a Socratic reading companion. NOT a summarizer.\n\nRULES:\n1. NEVER summarize. Refuse and explain why.\n2. Use Socratic questioning, never give direct answers.\n3. Be honest about shallow understanding. No false encouragement.\n4. Distinguish recognizing vs reconstructing ideas.\n5. Keep responses focused. One sharp question at a time.\n6. If user agrees with everything, probe harder.\n\nWHEN USER SHARES LEARNINGS:\n- Check alignment with author intent\n- Detect illusion of fluency\n- Find missed concepts that challenge their beliefs\n- Ask: can you explain without the author language?\n- Never confirm understanding too easily\n\nBOOK SUGGESTIONS: recommend books creating FRICTION with current thinking.\n\nATOMIC NOTES: one idea, user own words, what CHANGED not what author said.\n\n";
  if (cBk) p += "CURRENT BOOK: " + cBk; else p += "NO BOOK SELECTED. Discovery mode.";
  return p;
}
