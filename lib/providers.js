// Provider presets. NEW vs single-file HTML: lets users pick OpenAI or Groq (free)
// without knowing base URLs. "custom" preserves spec §9.9 API-agnostic behavior.
// Key stays browser-only (localStorage); browser streams DIRECTLY to chosen endpoint.
export const PROVIDERS = {
  openai: {
    label: "OpenAI",
    url: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    keyPrefix: "sk-",
    keysUrl: "https://platform.openai.com/api-keys",
    free: false,
  },
  groq: {
    label: "Groq (free)",
    url: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    keyPrefix: "gsk_",
    keysUrl: "https://console.groq.com/keys",
    free: true,
  },
  custom: {
    label: "Custom (any OpenAI-compatible)",
    url: "",
    model: "",
    keyPrefix: "",
    keysUrl: "",
    free: false,
  },
};

export const DEFAULT_PROVIDER = "openai";

// Best-effort: infer provider id from a stored base URL (for migrating old configs).
export function providerFromUrl(url) {
  if (!url) return "custom";
  if (url.includes("api.openai.com")) return "openai";
  if (url.includes("api.groq.com")) return "groq";
  return "custom";
}
