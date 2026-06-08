// Ported 1:1 from readtothink.html — E (escape) + F (lightweight markdown to HTML).
// F output is used with dangerouslySetInnerHTML for the .cmsg chat bubbles.
export function E(s) {
  const d = typeof document !== "undefined" ? document.createElement("div") : null;
  if (d) {
    d.textContent = s || "";
    return d.innerHTML;
  }
  // SSR fallback
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function F(t) {
  if (!t) return "";
  let h = E(t);
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  h = h.replace(/\n\n/g, "</p><p style='margin-top:0.6em'>");
  h = h.replace(/\n/g, "<br>");
  return "<p>" + h + "</p>";
}
