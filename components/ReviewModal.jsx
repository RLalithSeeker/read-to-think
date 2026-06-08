"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { dueNotes, noteKey, nextLabel } from "@/lib/srs";
import { F } from "@/lib/format";

const GRADES = [
  { g: 0, label: "Forgot", cls: "text-terra", border: "rgba(176,112,96,.4)" },
  { g: 1, label: "Hard", cls: "text-accent", border: "rgba(200,150,90,.35)" },
  { g: 2, label: "Good", cls: "text-sage/80", border: "rgba(123,154,107,.3)" },
  { g: 3, label: "Easy", cls: "text-sage", border: "rgba(123,154,107,.45)" },
];

export default function ReviewModal() {
  const { reviewOpen, setReviewOpen, notes, srs, gradeNote } = useApp();
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  // snapshot the due queue when the modal opens
  useEffect(() => {
    if (reviewOpen) {
      setQueue(dueNotes(srs, notes));
      setIdx(0);
      setRevealed(false);
      setReviewed(0);
    }
  }, [reviewOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!reviewOpen) return null;

  const n = queue[idx];
  const done = idx >= queue.length;

  function rate(grade) {
    gradeNote(n, grade);
    setReviewed((r) => r + 1);
    setRevealed(false);
    setIdx((i) => i + 1);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={() => setReviewOpen(false)} />
      <div className="relative bg-card border border-bdr rounded-2xl p-6 w-full max-w-lg anim-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="serif text-lg font-semibold"><i className="fas fa-rotate text-accent mr-2 text-sm" />Review</h3>
          <button onClick={() => setReviewOpen(false)} className="text-muted hover:text-fg transition-colors bg-transparent border-none cursor-pointer">
            <i className="fas fa-xmark" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-10">
            <div className="text-sage text-3xl mb-3"><i className="fas fa-circle-check" /></div>
            <p className="serif text-xl font-semibold mb-1">{reviewed > 0 ? "Nothing more due" : "Nothing due right now"}</p>
            <p className="text-muted text-sm mb-6">{reviewed > 0 ? "Reviewed " + reviewed + " note" + (reviewed === 1 ? "" : "s") + ". Come back later — spacing is the point." : "Write some notes, then return to test whether you can rebuild them."}</p>
            <button onClick={() => setReviewOpen(false)} className="bm">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted tracking-wider uppercase">{idx + 1} of {queue.length} due</span>
              <span className="text-[10px] text-muted/70">{n.book}{n.type === "dr" ? " · Deep Read" : " · Chat"}</span>
            </div>

            {!revealed ? (
              <div className="text-center py-8">
                <p className="text-muted text-sm mb-2">From <span className="text-fg font-medium">{n.book || "this note"}</span> —</p>
                <p className="serif text-lg text-fg mb-8">Can you reconstruct this note from memory?</p>
                <button onClick={() => setRevealed(true)} className="bm"><i className="fas fa-eye mr-2 text-sm" />Show the note</button>
                <p className="text-[11px] text-muted/50 mt-4">Try to say it out loud first. Recognising it is not the same as knowing it.</p>
              </div>
            ) : (
              <>
                <div className="bg-[#141412] border border-bdr rounded-xl p-5 mb-6">
                  <div className="cmsg text-sm leading-relaxed text-fg/90" dangerouslySetInnerHTML={{ __html: F(n.content) }} />
                </div>
                <p className="text-xs text-muted text-center mb-3">How well did you actually reconstruct it?</p>
                <div className="grid grid-cols-4 gap-2">
                  {GRADES.map((gr) => (
                    <button
                      key={gr.g}
                      onClick={() => rate(gr.g)}
                      className={"bs flex flex-col items-center gap-1 py-3 " + gr.cls}
                      style={{ borderColor: gr.border }}
                    >
                      <span className="text-sm font-medium">{gr.label}</span>
                      <span className="text-[10px] text-muted/60">{nextLabel(srs[noteKey(n)], gr.g)}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
