"use client";
import { useState } from "react";
import { AppProvider } from "@/lib/store";
import { demoCl } from "@/lib/deepread";
import Landing from "@/components/Landing";
import Header from "@/components/Header";
import DeepRead from "@/components/DeepRead";
import Library from "@/components/Library";
import Reader from "@/components/Reader";
import Chat from "@/components/Chat";
import NotesSidebar from "@/components/NotesSidebar";
import SettingsModal from "@/components/SettingsModal";
import ReviewModal from "@/components/ReviewModal";
import Toaster from "@/components/Toaster";

const FRESH = { step: "input", claims: [], idx: 0, notes: [], ref: {}, st: {}, stx: {}, an: {}, rev: {}, title: "" };

function Shell() {
  const [view, setView] = useState("landing"); // "landing" | "app"
  const [mode, setMode] = useState("deepread"); // "deepread" | "read" | "chat"
  const [drS, setDrS] = useState(FRESH);
  const [openBook, setOpenBook] = useState(null); // active book in Reader, null = Library
  const [seed, setSeed] = useState({ text: "", k: 0 }); // passage piped to Deep Read

  function openApp(m, step) {
    setMode(m);
    if (m === "deepread" && step) setDrS((s) => ({ ...s, step }));
    setView("app");
  }

  // Reader → Deep Read: drop a marked passage into the think loop
  function sendToDeepRead(text) {
    setSeed((s) => ({ text, k: s.k + 1 }));
    setMode("deepread");
  }

  function startDemo() {
    setDrS({
      ...FRESH,
      claims: demoCl.map((c, i) => ({ id: i, text: c.text, reasoning: c.reasoning, fq: c.fq })),
      title: "On Reading to Think",
      step: "claims",
    });
    setMode("deepread");
    setView("app");
  }

  function goHome() { setView("landing"); }

  return (
    <>
      {view === "landing" && <Landing onDemo={startDemo} onOpenApp={openApp} />}

      {view === "app" && (
        <section className="relative z-10 flex flex-col" style={{ height: "100dvh" }}>
          <Header mode={mode} setMode={setMode} onHome={goHome} drS={drS} />
          <div className={"flex-1 min-h-0 flex flex-col" + (mode === "deepread" ? "" : " hidden")}>
            <DeepRead drS={drS} setDrS={setDrS} onHome={goHome} seed={seed.text} seedKey={seed.k} />
          </div>
          <div className={"flex-1 min-h-0 flex flex-col" + (mode === "read" ? "" : " hidden")}>
            {openBook
              ? <Reader book={openBook} onClose={() => setOpenBook(null)} onSendToDeepRead={sendToDeepRead} />
              : <Library onOpen={setOpenBook} />}
          </div>
          <div className={"flex-1 min-h-0 flex flex-col" + (mode === "chat" ? "" : " hidden")}>
            <Chat />
          </div>
        </section>
      )}

      <SettingsModal />
      <NotesSidebar />
      <ReviewModal />
      <Toaster />
    </>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
