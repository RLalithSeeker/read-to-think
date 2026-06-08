// Zettelkasten-style links between notes (Luhmann). Symmetric, localStorage rt_links.
// Shape: { [noteKey]: [otherKey, ...] }. Key = String(note.ts), same as srs noteKey.
export function loadLinks() {
  try { return JSON.parse(localStorage.getItem("rt_links") || "{}"); } catch (e) { return {}; }
}

export function saveLinks(links) {
  try { localStorage.setItem("rt_links", JSON.stringify(links)); } catch (e) {}
}

export function linksFor(links, key) {
  return links[key] || [];
}

export function isLinked(links, a, b) {
  return (links[a] || []).includes(b);
}

export function toggleLink(links, a, b) {
  if (a === b) return links;
  const next = { ...links };
  const add = !isLinked(links, a, b);
  for (const [x, y] of [[a, b], [b, a]]) {
    const arr = new Set(next[x] || []);
    if (add) arr.add(y); else arr.delete(y);
    next[x] = Array.from(arr);
    if (!next[x].length) delete next[x];
  }
  return next;
}

// drop all links touching a removed note key
export function pruneLinks(links, key) {
  const next = {};
  for (const k of Object.keys(links)) {
    if (k === key) continue;
    const arr = links[k].filter((v) => v !== key);
    if (arr.length) next[k] = arr;
  }
  return next;
}
