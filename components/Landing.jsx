"use client";

export default function Landing({ onDemo, onOpenApp }) {
  return (
    <section className="relative z-10 min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"><i className="fas fa-brain text-bg text-sm" /></div>
          <span className="serif font-semibold text-lg text-fg">Read to Think</span>
        </div>
        <button onClick={() => onOpenApp("chat")} className="text-muted hover:text-accent text-sm transition-colors bg-transparent border-none cursor-pointer font-[inherit]">
          AI Companion <i className="fas fa-arrow-right ml-1 text-xs" />
        </button>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <p className="text-accent text-sm font-medium tracking-widest uppercase mb-6 anim-up">A different kind of reading companion</p>
        <h1 className="serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 anim-up" style={{ animationDelay: ".1s", lineHeight: 1.15 }}>
          Don&apos;t summarize.<br /><span className="text-accent">Let the book challenge you.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed anim-up" style={{ animationDelay: ".2s" }}>
          Most tools turn books into bullet points. This one turns them into thinking. Built on Adler&apos;s analytical reading, Luhmann&apos;s Zettelkasten, and cognitive science on why familiarity is the enemy of understanding.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 anim-up" style={{ animationDelay: ".3s" }}>
          <button onClick={onDemo} className="bm text-base px-8 py-3.5"><i className="fas fa-play mr-2 text-sm" />Try the Demo</button>
          <button onClick={() => onOpenApp("deepread", "input")} className="bs text-base px-8 py-3.5"><i className="fas fa-paste mr-2 text-sm" />Paste Your Text</button>
        </div>
        <button onClick={() => onOpenApp("chat")} className="mt-5 text-sm text-muted hover:text-accent transition-colors bg-transparent border-none cursor-pointer font-[inherit] anim-up" style={{ animationDelay: ".4s" }}>
          <i className="fas fa-comments mr-1.5 text-xs" />Or talk to the AI Companion directly
        </button>
      </div>
      <div className="max-w-5xl mx-auto px-6 pb-20 pt-8 w-full">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="pc anim-up" style={{ animationDelay: ".2s" }}>
            <div className="text-terra text-2xl mb-3"><i className="fas fa-eye-slash" /></div>
            <h3 className="serif font-semibold text-fg mb-2">The Illusion of Fluency</h3>
            <p className="text-muted text-sm leading-relaxed">Rozenblit &amp; Keil (Yale) proved that re-reading and highlighting create a feeling of knowing that isn&apos;t real understanding.</p>
          </div>
          <div className="pc anim-up" style={{ animationDelay: ".3s" }}>
            <div className="text-sage text-2xl mb-3"><i className="fas fa-pen-nib" /></div>
            <h3 className="serif font-semibold text-fg mb-2">Write to Think, Not to Store</h3>
            <p className="text-muted text-sm leading-relaxed">Luhmann wrote 70+ books using one idea per slip, always in his own words. His system generated thinking, not storage.</p>
          </div>
          <div className="pc anim-up" style={{ animationDelay: ".4s" }}>
            <div className="text-accent text-2xl mb-3"><i className="fas fa-arrows-rotate" /></div>
            <h3 className="serif font-semibold text-fg mb-2">Be Changed, Not Informed</h3>
            <p className="text-muted text-sm leading-relaxed">Adler&apos;s highest reading level: what does this do to what I already believe? A book succeeds only when it creates friction.</p>
          </div>
        </div>
      </div>
      <div className="text-center pb-12 px-6">
        <blockquote className="serif italic text-muted text-sm max-w-lg mx-auto">
          &quot;A book is a conversation between you and the author. If you only listen, you are not having a conversation.&quot;
          <span className="block mt-2 text-accent not-italic text-xs tracking-wider uppercase">— Mortimer Adler</span>
        </blockquote>
      </div>
    </section>
  );
}
