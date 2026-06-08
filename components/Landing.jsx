"use client";

const GITHUB_URL = "https://github.com/RLalithSeeker/read-to-think";
const LINKEDIN_URL = ""; // paste your LinkedIn profile URL to show the icon
const FEEDBACK_MAIL = "mailto:ravula.lalith@gmail.com?subject=Read%20to%20Think%20%E2%80%94%20feedback&body=What%20I%20loved%2C%20and%20what%20I%27d%20want%20next%3A%0A%0A";

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

      {/* How it works — the Deep Read method */}
      <div className="max-w-5xl mx-auto px-6 py-16 w-full border-t border-bdr">
        <p className="text-accent text-xs font-medium tracking-widest uppercase mb-3 text-center">The Deep Read method</p>
        <h2 className="serif text-3xl md:text-4xl font-bold text-center mb-12">Three steps that make a book argue back</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: 1, t: "Think First", d: "Before the author says a word, you write what you already believe. The reasoning stays locked until you do." },
            { n: 2, t: "Reveal & Take a Stance", d: "Now see the author's argument and place yourself on a spectrum — agree to disagree — and say why." },
            { n: 3, t: "Write an Atomic Note", d: "Capture the one thing that changed in your thinking, in your own words. We flag it if you only echo the author." },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-4"><span className="serif text-accent text-xl font-bold">{s.n}</span></div>
              <h3 className="serif font-semibold text-fg mb-2">{s.t}</h3>
              <p className="text-muted text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two ways in */}
      <div className="max-w-5xl mx-auto px-6 py-16 w-full border-t border-bdr">
        <h2 className="serif text-3xl md:text-4xl font-bold text-center mb-12">Two ways in</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="pc flex flex-col">
            <div className="text-accent text-2xl mb-3"><i className="fas fa-layer-group" /></div>
            <h3 className="serif text-xl font-semibold text-fg mb-2">Deep Read</h3>
            <p className="text-muted text-sm leading-relaxed mb-6 flex-1">Paste a passage. We pull out its claims and walk you through them one by one — think, reveal, take a stance, write a note.</p>
            <button onClick={onDemo} className="bm self-start"><i className="fas fa-play mr-2 text-sm" />Try the demo</button>
          </div>
          <div className="pc flex flex-col">
            <div className="text-sage text-2xl mb-3"><i className="fas fa-comments" /></div>
            <h3 className="serif text-xl font-semibold text-fg mb-2">AI Socratic Companion</h3>
            <p className="text-muted text-sm leading-relaxed mb-6 flex-1">A chat that refuses to summarize. It questions your reading, catches the illusion of fluency, and pushes you to reconstruct ideas.</p>
            <button onClick={() => onOpenApp("chat")} className="bs self-start"><i className="fas fa-arrow-right mr-2 text-sm" />Open the companion</button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16 w-full border-t border-bdr">
        <h2 className="serif text-3xl md:text-4xl font-bold text-center mb-3">Built to fight the illusion of fluency</h2>
        <p className="text-muted text-center text-sm mb-12 max-w-xl mx-auto">Every feature exists to stop you mistaking recognition for understanding.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { i: "fa-sliders", t: "Stance, not a checkbox", d: "A spectrum from disagree to agree — nuance over a binary." },
            { i: "fa-pen-nib", t: "Atomic notes", d: "One idea, your words, what changed — never a summary." },
            { i: "fa-magnifying-glass-chart", t: "Fluency check", d: "Flags when your note just reuses the author's vocabulary." },
            { i: "fa-rotate", t: "Spaced review", d: "Resurfaces notes and asks you to rebuild them from memory." },
            { i: "fa-link", t: "Linked notes", d: "Connect ideas Zettelkasten-style; thinking emerges from the links." },
            { i: "fa-key", t: "Your key, your data", d: "Bring an OpenAI or free Groq key — it never leaves your browser." },
          ].map((f, i) => (
            <div key={i} className="pc">
              <div className="text-accent text-xl mb-3"><i className={"fas " + f.i} /></div>
              <h3 className="font-semibold text-fg text-sm mb-1.5">{f.t}</h3>
              <p className="text-muted text-xs leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What it's not */}
      <div className="max-w-3xl mx-auto px-6 py-12 text-center border-t border-bdr">
        <p className="text-muted text-sm mb-3 tracking-wider uppercase">What this is not</p>
        <p className="serif text-2xl md:text-3xl font-bold text-fg/90">Not a summarizer. <span className="text-terra">Not</span> flashcards. <span className="text-terra">Not</span> a highlighter.</p>
        <p className="text-muted text-sm mt-4 max-w-lg mx-auto">Those make you feel productive while you forget. This makes you think.</p>
      </div>

      <div className="text-center pb-12 px-6 border-t border-bdr pt-16">
        <blockquote className="serif italic text-muted text-sm max-w-lg mx-auto">
          &quot;A book is a conversation between you and the author. If you only listen, you are not having a conversation.&quot;
          <span className="block mt-2 text-accent not-italic text-xs tracking-wider uppercase">— Mortimer Adler</span>
        </blockquote>
      </div>

      {/* Final CTA */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center border-t border-bdr w-full">
        <h2 className="serif text-3xl md:text-4xl font-bold mb-4">Stop collecting summaries.<br /><span className="text-accent">Start changing your mind.</span></h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button onClick={onDemo} className="bm text-base px-8 py-3.5"><i className="fas fa-play mr-2 text-sm" />Try the Demo</button>
          <button onClick={() => onOpenApp("deepread", "input")} className="bs text-base px-8 py-3.5"><i className="fas fa-paste mr-2 text-sm" />Paste Your Text</button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-bdr py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center"><i className="fas fa-brain text-bg text-[10px]" /></div>
          <span className="serif font-semibold text-fg text-sm">Read to Think</span>
        </div>

        <div className="flex items-center justify-center gap-6 mb-5">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-muted hover:text-accent transition-colors text-sm flex items-center gap-2">
            <i className="fab fa-github text-base" /><span className="hidden sm:inline">GitHub</span>
          </a>
          {LINKEDIN_URL && (
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="text-muted hover:text-accent transition-colors text-sm flex items-center gap-2">
              <i className="fab fa-linkedin-in text-base" /><span className="hidden sm:inline">LinkedIn</span>
            </a>
          )}
          <a href={FEEDBACK_MAIL} className="text-muted hover:text-accent transition-colors text-sm flex items-center gap-2">
            <i className="fas fa-envelope text-base" /><span className="hidden sm:inline">Feedback</span>
          </a>
        </div>

        <p className="text-muted text-sm mb-2">
          Love it, or want a feature? <a href={FEEDBACK_MAIL} className="text-accent hover:text-accent-h transition-colors">Tell me</a> — I read everything.
        </p>
        <p className="text-muted/50 text-xs">Built on Adler, Luhmann, and cognitive science. Your key never leaves your browser.</p>
      </footer>
    </section>
  );
}
