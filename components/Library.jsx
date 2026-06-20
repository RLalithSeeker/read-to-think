"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/store";
import { allBooks, putBook, delBook, getBook, uid } from "@/lib/idb";
import { toBlocks, guessTitle } from "@/lib/reader";

export default function Library({ onOpen }) {
  const { toast } = useApp();
  const [books, setBooks] = useState([]);
  const [adding, setAdding] = useState(false);
  const [paste, setPaste] = useState("");
  const [title, setTitle] = useState("");
  const fileRef = useRef(null);

  const refresh = () => allBooks().then(setBooks).catch(() => {});
  useEffect(() => { refresh(); }, []);

  async function save(text, fileName) {
    const t = text.trim();
    if (t.length < 50) { toast("Need at least 50 characters of text."); return; }
    const book = {
      id: uid(),
      title: (title.trim() || guessTitle(t, fileName)),
      text: t,
      nBlocks: toBlocks(t).length,
      added: Date.now(),
      lastOpened: 0,
      pos: 0,
    };
    await putBook(book);
    setPaste(""); setTitle(""); setAdding(false);
    await refresh();
    toast("Added to your shelf.");
  }

  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => save(String(r.result), f.name);
    r.readAsText(f);
    e.target.value = "";
  }

  async function open(id) {
    const b = await getBook(id);
    if (b) onOpen(b);
  }

  async function remove(e, id) {
    e.stopPropagation();
    if (!confirm("Remove this book and all its marks? This cannot be undone.")) return;
    await delBook(id);
    await refresh();
    toast("Removed.");
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-2xl text-fg">Your shelf</h2>
            <p className="text-sm text-muted mt-1">Read here. Mark with a reaction, not a highlighter.</p>
          </div>
          {!adding && (
            <button onClick={() => setAdding(true)} className="px-4 py-2 rounded-lg bg-accent text-bg text-sm font-medium border-none cursor-pointer">
              <i className="fas fa-plus mr-1.5 text-xs" />Add a book
            </button>
          )}
        </div>

        {adding && (
          <div className="mb-8 bg-card border border-bdr rounded-xl p-4 anim-up">
            <input
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full mb-3 bg-bg border border-bdr rounded-lg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
            />
            <textarea
              value={paste} onChange={(e) => setPaste(e.target.value)}
              placeholder="Paste the text of a book, chapter, essay…"
              className="w-full h-40 bg-bg border border-bdr rounded-lg px-3 py-2 text-sm text-fg outline-none focus:border-accent resize-y font-serif leading-relaxed"
            />
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button onClick={() => save(paste)} className="px-4 py-2 rounded-lg bg-accent text-bg text-sm font-medium border-none cursor-pointer">Add to shelf</button>
              <button onClick={() => fileRef.current && fileRef.current.click()} className="px-4 py-2 rounded-lg bg-bg border border-bdr text-fg text-sm cursor-pointer">
                <i className="fas fa-file-arrow-up mr-1.5 text-xs" />Upload .txt / .md
              </button>
              <input ref={fileRef} type="file" accept=".txt,.md,.markdown,.text,text/plain" onChange={onFile} className="hidden" />
              <button onClick={() => { setAdding(false); setPaste(""); setTitle(""); }} className="px-3 py-2 text-muted text-sm bg-transparent border-none cursor-pointer ml-auto">Cancel</button>
            </div>
            <p className="text-[11px] text-muted mt-2">EPUB / PDF parsing comes next. For now: paste or a plain-text file.</p>
          </div>
        )}

        {books.length === 0 && !adding && (
          <div className="text-center py-16 text-muted">
            <i className="fas fa-book-open text-3xl mb-3 opacity-40" />
            <p className="text-sm">Your shelf is empty. Add a book to start reading.</p>
          </div>
        )}

        <div className="grid gap-3">
          {books.map((b) => (
            <div key={b.id} onClick={() => open(b.id)}
              className="group bg-card border border-bdr rounded-xl p-4 cursor-pointer hover:border-accent/50 transition-colors flex items-center gap-4">
              <div className="w-10 h-12 rounded bg-accent/15 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-book text-accent text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-serif text-fg truncate">{b.title}</div>
                <div className="text-[11px] text-muted mt-0.5">
                  {b.nBlocks} passages
                  {b.lastOpened ? " · opened " + new Date(b.lastOpened).toLocaleDateString() : " · not started"}
                </div>
              </div>
              <button onClick={(e) => remove(e, b.id)} title="Remove"
                className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-terra bg-transparent border-none cursor-pointer transition-all">
                <i className="fas fa-trash text-xs" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
