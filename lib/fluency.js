// Illusion-of-fluency heuristic (spec source #3): how much of the reader's atomic
// note reuses the author's vocabulary instead of their own words. Pure, no network.
const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "than", "that", "this", "these", "those",
  "is", "are", "was", "were", "be", "been", "being", "am", "do", "does", "did", "doing",
  "have", "has", "had", "having", "will", "would", "shall", "should", "can", "could", "may",
  "might", "must", "of", "to", "in", "on", "at", "by", "for", "with", "about", "into", "from",
  "as", "it", "its", "you", "your", "i", "my", "me", "we", "our", "they", "their", "them",
  "he", "she", "his", "her", "not", "no", "so", "what", "which", "who", "when", "where", "how",
  "why", "all", "any", "some", "more", "most", "very", "just", "only", "also", "too", "out",
  "up", "down", "over", "under", "again", "because", "while", "between", "thing", "things",
  "there", "here", "such", "each", "both", "many", "much", "one", "every", "own", "get", "got",
]);

function normalize(w) {
  // light stemming so "summarize/summarizing", "idea/ideas" match
  return w.replace(/(ing|edly|ed|ly|es|s)$/, "");
}

function contentWords(s) {
  const raw = (String(s || "").toLowerCase().match(/[a-z']+/g) || []);
  const out = [];
  for (const w of raw) {
    if (w.length < 3 || STOP.has(w)) continue;
    out.push(normalize(w));
  }
  return out;
}

// returns { level, ratio, borrowed[], noteCount }
// level: "empty" | "short" | "good" | "caution" | "warn"
export function analyzeFluency(note, author) {
  const nw = contentWords(note);
  if (!nw.length) return { level: "empty", ratio: 0, borrowed: [], noteCount: 0 };
  if (nw.length < 4) return { level: "short", ratio: 0, borrowed: [], noteCount: nw.length };
  const aset = new Set(contentWords(author));
  const borrowed = new Set();
  let overlap = 0;
  for (const w of nw) {
    if (aset.has(w)) { overlap++; borrowed.add(w); }
  }
  const ratio = overlap / nw.length;
  const level = ratio >= 0.5 ? "warn" : ratio >= 0.3 ? "caution" : "good";
  return { level, ratio, borrowed: [...borrowed].slice(0, 6), noteCount: nw.length };
}
