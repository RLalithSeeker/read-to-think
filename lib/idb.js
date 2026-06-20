// Zero-dependency IndexedDB wrapper for the book library (Phase 1).
// Books + marks live here, NOT localStorage — book text is too large for the 5MB cap.
// Local-first: nothing leaves the browser. Convex sync deferred to Phase 3.

const DB_NAME = "rt_library";
const DB_VER = 1;

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("no-indexeddb"));
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("books")) {
        db.createObjectStore("books", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("marks")) {
        const ms = db.createObjectStore("marks", { keyPath: "id" });
        ms.createIndex("bookId", "bookId", { unique: false });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode, fn) {
  return openDB().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    let out;
    Promise.resolve(fn(s, t)).then((v) => { out = v; }).catch(reject);
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);

// ---- books ----
export function putBook(book) { return tx("books", "readwrite", (s) => reqP(s.put(book))); }
export function getBook(id) { return tx("books", "readonly", (s) => reqP(s.get(id))); }
export function allBooks() {
  return tx("books", "readonly", (s) => reqP(s.getAll()))
    .then((arr) => (arr || []).sort((a, b) => (b.lastOpened || b.added || 0) - (a.lastOpened || a.added || 0)));
}
export async function delBook(id) {
  const ms = await marksFor(id);
  await tx("marks", "readwrite", (s) => Promise.all(ms.map((m) => reqP(s.delete(m.id)))));
  return tx("books", "readwrite", (s) => reqP(s.delete(id)));
}

// ---- marks ----
export function putMark(mark) { return tx("marks", "readwrite", (s) => reqP(s.put(mark))); }
export function delMark(id) { return tx("marks", "readwrite", (s) => reqP(s.delete(id))); }
export function marksFor(bookId) {
  return tx("marks", "readonly", (s) => reqP(s.index("bookId").getAll(bookId)))
    .then((arr) => (arr || []).sort((a, b) => (a.blockIdx - b.blockIdx) || (a.start - b.start)));
}
