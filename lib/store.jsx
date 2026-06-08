"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { PROVIDERS, DEFAULT_PROVIDER, providerFromUrl } from "./providers";
import { loadSrs, saveSrs, schedule, noteKey, dueNotes } from "./srs";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  // ----- settings (cfg) ----- key stays browser-only (spec §9.9)
  const [cfg, setCfg] = useState({ provider: DEFAULT_PROVIDER, key: "", url: PROVIDERS[DEFAULT_PROVIDER].url, model: PROVIDERS[DEFAULT_PROVIDER].model });
  const [notes, setNotes] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [srs, setSrs] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const [hydrated, setHydrated] = useState(false);

  // load persisted state once
  useEffect(() => {
    try {
      const key = localStorage.getItem("rt_k") || "";
      const url = localStorage.getItem("rt_u") || PROVIDERS[DEFAULT_PROVIDER].url;
      const model = localStorage.getItem("rt_m") || PROVIDERS[DEFAULT_PROVIDER].model;
      const provider = localStorage.getItem("rt_provider") || providerFromUrl(url);
      setCfg({ provider, key, url, model });
    } catch (e) {}
    try {
      const sn = localStorage.getItem("rt_notes");
      if (sn) setNotes(JSON.parse(sn));
    } catch (e) {}
    setSrs(loadSrs());
    setHydrated(true);
    // open settings on first visit if no key
    try {
      if (!localStorage.getItem("rt_k")) setTimeout(() => setSettingsOpen(true), 500);
    } catch (e) {}
  }, []);

  const toast = useCallback((m) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(m);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const saveCfg = useCallback((next) => {
    setCfg(next);
    try {
      localStorage.setItem("rt_provider", next.provider);
      localStorage.setItem("rt_k", next.key);
      localStorage.setItem("rt_u", next.url);
      localStorage.setItem("rt_m", next.model);
    } catch (e) {}
  }, []);

  const persistNotes = useCallback((arr) => {
    try { localStorage.setItem("rt_notes", JSON.stringify(arr)); } catch (e) {}
  }, []);

  const addNote = useCallback((note) => {
    setNotes((prev) => {
      // dedupe chat notes by message id (mid)
      if (note.mid != null && prev.some((n) => n.mid === note.mid)) return prev;
      const arr = [...prev, note];
      persistNotes(arr);
      return arr;
    });
  }, [persistNotes]);

  const delNote = useCallback((ts) => {
    setNotes((prev) => {
      const arr = prev.filter((n) => n.ts !== ts);
      persistNotes(arr);
      return arr;
    });
  }, [persistNotes]);

  const clrNotes = useCallback(() => {
    setNotes((prev) => {
      if (!prev.length) return prev;
      persistNotes([]);
      try { localStorage.setItem("rt_srs", "{}"); } catch (e) {}
      setSrs({});
      toast("Notes cleared.");
      return [];
    });
  }, [persistNotes, toast]);

  const gradeNote = useCallback((n, grade) => {
    setSrs((prev) => {
      const key = noteKey(n);
      const next = { ...prev, [key]: schedule(prev[key], grade) };
      saveSrs(next);
      return next;
    });
  }, []);

  const dueCount = dueNotes(srs, notes).length;

  const value = {
    cfg, saveCfg,
    notes, addNote, delNote, clrNotes,
    settingsOpen, setSettingsOpen,
    notesOpen, setNotesOpen,
    reviewOpen, setReviewOpen,
    srs, gradeNote, dueCount,
    toast, toastMsg,
    hydrated,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
