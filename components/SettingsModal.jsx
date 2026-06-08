"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { PROVIDERS } from "@/lib/providers";

export default function SettingsModal() {
  const { settingsOpen, setSettingsOpen, cfg, saveCfg, toast } = useApp();
  const [provider, setProvider] = useState(cfg.provider);
  const [key, setKey] = useState(cfg.key);
  const [url, setUrl] = useState(cfg.url);
  const [model, setModel] = useState(cfg.model);
  const [showKey, setShowKey] = useState(false);

  // sync local form from cfg each time modal opens
  useEffect(() => {
    if (settingsOpen) {
      setProvider(cfg.provider);
      setKey(cfg.key);
      setUrl(cfg.url);
      setModel(cfg.model);
      setShowKey(false);
    }
  }, [settingsOpen, cfg]);

  function pickProvider(id) {
    setProvider(id);
    if (id !== "custom") {
      setUrl(PROVIDERS[id].url);
      setModel(PROVIDERS[id].model);
    }
  }

  function save() {
    const k = key.trim();
    if (!k) { toast("API key is required."); return; }
    const u = url.trim() || PROVIDERS.openai.url;
    const m = model.trim() || PROVIDERS.openai.model;
    saveCfg({ provider, key: k, url: u, model: m });
    setSettingsOpen(false);
    toast("Settings saved.");
  }

  const p = PROVIDERS[provider] || PROVIDERS.custom;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ opacity: settingsOpen ? 1 : 0, pointerEvents: settingsOpen ? "auto" : "none", transition: "opacity .25s" }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={() => setSettingsOpen(false)} />
      <div
        className="relative bg-card border border-bdr rounded-2xl p-6 w-full max-w-md"
        style={{ transform: settingsOpen ? "scale(1)" : "scale(.95)", opacity: settingsOpen ? 1 : 0, transition: "all .25s" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="serif text-lg font-semibold">Connection Settings</h3>
          <button onClick={() => setSettingsOpen(false)} className="text-muted hover:text-fg transition-colors bg-transparent border-none cursor-pointer">
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="space-y-4">
          {/* provider picker — NEW: OpenAI / Groq (free) / Custom */}
          <div>
            <label className="block text-[11px] text-muted mb-1.5 tracking-wider uppercase font-medium">Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PROVIDERS).map(([id, pr]) => (
                <button
                  key={id}
                  onClick={() => pickProvider(id)}
                  className="tb"
                  style={{
                    border: "1px solid",
                    borderColor: provider === id ? "#C8965A" : "#2A2A26",
                    background: provider === id ? "rgba(200,150,90,.12)" : "transparent",
                    color: provider === id ? "#C8965A" : "#9B9485",
                    padding: "8px 6px",
                    fontSize: 12,
                  }}
                >
                  {id === "custom" ? "Custom" : pr.label}
                </button>
              ))}
            </div>
            {p.free && (
              <p className="text-[11px] text-sage mt-1.5"><i className="fas fa-circle-check mr-1" />Free — get a key at <a href={p.keysUrl} target="_blank" rel="noreferrer" className="underline">console.groq.com/keys</a></p>
            )}
          </div>
          <div>
            <label className="block text-[11px] text-muted mb-1.5 tracking-wider uppercase font-medium">API Key <span className="text-terra">*</span></label>
            <div className="relative">
              <input type={showKey ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} className="si" placeholder={p.keyPrefix ? p.keyPrefix + "..." : "your key..."} />
              <button onClick={() => setShowKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors text-sm bg-transparent border-none cursor-pointer">
                <i className={showKey ? "fas fa-eye-slash" : "fas fa-eye"} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-muted mb-1.5 tracking-wider uppercase font-medium">Base URL</label>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} disabled={provider !== "custom"} className="si" placeholder="https://api.openai.com/v1" style={provider !== "custom" ? { opacity: 0.6 } : undefined} />
          </div>
          <div>
            <label className="block text-[11px] text-muted mb-1.5 tracking-wider uppercase font-medium">Model</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="si" placeholder="gpt-4o-mini" />
          </div>
        </div>
        <button onClick={save} className="bm w-full mt-6 py-3">Save &amp; Start</button>
        <p className="text-[10px] text-muted/40 text-center mt-3">Your key is stored only in this browser and sent directly to your chosen provider.</p>
      </div>
    </div>
  );
}
