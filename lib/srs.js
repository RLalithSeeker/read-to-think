// Lightweight SM-2-style spaced repetition over notes. Pure localStorage, no backend.
// Stored at rt_srs as { [noteKey]: { reps, interval, ease, due } }. interval in days.
const DAY = 86400000;

export function noteKey(n) {
  return String(n.ts);
}

export function loadSrs() {
  try { return JSON.parse(localStorage.getItem("rt_srs") || "{}"); } catch (e) { return {}; }
}

export function saveSrs(srs) {
  try { localStorage.setItem("rt_srs", JSON.stringify(srs)); } catch (e) {}
}

export function isDue(srs, n, now = Date.now()) {
  const e = srs[noteKey(n)];
  if (!e) return true; // never reviewed -> due
  return e.due <= now;
}

export function dueNotes(srs, notes, now = Date.now()) {
  return notes.filter((n) => isDue(srs, n, now));
}

// grade: 0 Forgot, 1 Hard, 2 Good, 3 Easy
export function schedule(entry, grade, now = Date.now()) {
  let { reps = 0, interval = 0, ease = 2.5 } = entry || {};
  if (grade === 0) {
    reps = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    return { reps, interval, ease, due: now + 10 * 60 * 1000 }; // 10 min
  }
  reps += 1;
  if (grade === 1) ease = Math.max(1.3, ease - 0.15);
  else if (grade === 3) ease = ease + 0.15;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 3;
  else interval = Math.round(interval * ease);
  if (grade === 1) interval = Math.max(1, Math.round(interval * 0.6));
  return { reps, interval, ease, due: now + interval * DAY };
}

export function nextLabel(entry, grade) {
  const e = schedule(entry, grade);
  if (e.interval === 0) return "10m";
  if (e.interval === 1) return "1d";
  return e.interval + "d";
}
