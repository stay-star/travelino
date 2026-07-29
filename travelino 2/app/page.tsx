"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
  imagePreview?: string;
};

type Profile = {
  name?: string;
  homeCountry?: string;
  dietaryRestrictions?: string[];
  travelExperience?: "erste_reise" | "erfahren" | "vielreisend";
};

const DIET_OPTIONS = [
  "Vegetarisch",
  "Vegan",
  "Glutenfrei",
  "Erdnussallergie",
  "Meeresfrüchte-Allergie",
  "Laktoseintoleranz",
  "Halal",
];

// Themenoffene Beispiele - bewusst NICHT nur Essen, damit von Anfang an klar
// ist: das hier ist für jede Situation, nicht nur Restaurants.
const EXAMPLE_PROMPTS = [
  "Ist 500 LKR für ein Tuk-Tuk zum Strand fair?",
  "Was soll ich heute Nachmittag hier unternehmen?",
  "Fühlt sich das gerade sicher an?",
  "Lohnt sich diese Tour für den Preis?",
];

export default function Home() {
  const [profile, setProfile] = useState<Profile>({});
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Profil laden, falls schon mal in Einstellungen ausgefüllt - aber NIE
  // als Voraussetzung zum Nutzen der App.
  useEffect(() => {
    const saved = localStorage.getItem("travelino_profile");
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function saveProfile(next: Profile) {
    setProfile(next);
    localStorage.setItem("travelino_profile", JSON.stringify(next));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function sendMessage(text: string) {
    if (!text.trim() && !imageFile) return;
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", text, imagePreview: imagePreview || undefined },
    ]);

    try {
      let imageBase64: string | undefined;
      let imageMediaType: string | undefined;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        imageMediaType = imageFile.type;
      }

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, imageBase64, imageMediaType, profile }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer || data.error || "Keine Antwort erhalten." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Verbindungsfehler. Bitte nochmal versuchen." },
      ]);
    } finally {
      setQuestion("");
      setImageFile(null);
      setImagePreview(null);
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-screen max-w-lg mx-auto">
      {/* Header */}
      <header className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-teal-700 flex items-center justify-center text-sm font-semibold">
            T
          </div>
          <div>
            <h1 className="font-semibold leading-tight">Travelino</h1>
            <p className="text-xs text-neutral-500 leading-tight">
              Unawatuna · dein Begleiter vor Ort
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition"
          aria-label="Einstellungen"
        >
          ⚙
        </button>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="mt-6 space-y-5">
            <div className="text-center px-4">
              <p className="text-neutral-300 text-sm">
                Frag mich alles, was dir gerade begegnet – Preis, Sicherheit,
                Essen, was du unternehmen sollst. Ich sag dir direkt, was ich
                an deiner Stelle tun würde.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 px-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-left text-sm px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-brand-600 transition text-neutral-300"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-neutral-900 border border-neutral-800"
              }`}
            >
              {m.imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.imagePreview} alt="Upload" className="rounded-lg mb-2 max-h-48" />
              )}
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-2.5 text-sm text-neutral-500">
              Travelino überlegt...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Eingabe */}
      <div className="border-t border-neutral-800 p-3">
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="h-16 rounded-lg" />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-neutral-700 rounded-full w-5 h-5 text-xs"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center"
            aria-label="Foto hochladen"
          >
            📷
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(question);
              }
            }}
            placeholder="Frag mich irgendwas..."
            rows={1}
            className="flex-1 rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={() => sendMessage(question)}
            disabled={loading}
            className="shrink-0 w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 flex items-center justify-center"
            aria-label="Senden"
          >
            ➤
          </button>
        </div>
      </div>

      {/* Einstellungen - optional, nie Zugangsvoraussetzung */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-20">
          <div className="bg-neutral-950 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Dein Profil</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Komplett optional - hilft mir nur, dir gezieltere Antworten zu geben.
            </p>

            <label className="block mb-3">
              <span className="text-xs text-neutral-400">Name</span>
              <input
                value={profile.name || ""}
                onChange={(e) => saveProfile({ ...profile, name: e.target.value })}
                className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              />
            </label>

            <label className="block mb-3">
              <span className="text-xs text-neutral-400">Herkunftsland</span>
              <input
                value={profile.homeCountry || ""}
                onChange={(e) => saveProfile({ ...profile, homeCountry: e.target.value })}
                className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              />
            </label>

            <div className="block mb-4">
              <span className="text-xs text-neutral-400">Ernährung / Allergien</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {DIET_OPTIONS.map((option) => {
                  const active = (profile.dietaryRestrictions || []).includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        const current = profile.dietaryRestrictions || [];
                        const next = active
                          ? current.filter((d) => d !== option)
                          : [...current, option];
                        saveProfile({ ...profile, dietaryRestrictions: next });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs border transition ${
                        active
                          ? "bg-brand-600 border-brand-600 text-white"
                          : "border-neutral-700 text-neutral-300"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full rounded-lg bg-brand-600 hover:bg-brand-500 transition py-2.5 text-sm font-medium"
            >
              Fertig
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
