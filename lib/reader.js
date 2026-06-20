// Reader helpers: reaction taxonomy + book ingestion.
// React-don't-highlight: a mark MUST carry a reaction (a stance), never bare colour.
// This is the anti-fluency-illusion rule — recognition is cheap, reconstruction is the point.

export const REACTIONS = [
  { id: "question", sym: "?", label: "I have a question", color: "accent", prompt: true },
  { id: "insight", sym: "!", label: "This changed something", color: "sage", prompt: true },
  { id: "disagree", sym: "✗", label: "I disagree", color: "terra", prompt: true },
  { id: "connect", sym: "↔", label: "Connects to…", color: "muted", prompt: true },
  { id: "recall", sym: "★", label: "Test me on this later", color: "fg", prompt: false },
];

export const reactById = (id) => REACTIONS.find((r) => r.id === id) || REACTIONS[0];

// Split raw text into paragraph blocks. Marks anchor to {blockIdx, start, end}
// so highlights survive re-render without fragile global offsets.
export function toBlocks(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
}

export function guessTitle(text, fileName) {
  if (fileName) return fileName.replace(/\.(txt|md|markdown|html?|text)$/i, "").slice(0, 80);
  const first = toBlocks(text)[0] || "Untitled";
  return first.slice(0, 60);
}
