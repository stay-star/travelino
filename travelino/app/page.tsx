"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  text: string;
  imagePreview?: string;
};

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("travelino_profile");
    if (!saved) {
      router.push("/onboarding");
    } else {
      setProfile(JSON.parse(saved));
    }
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Entfernt das "data:image/jpeg;base64," Prefix
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSend() {
    if (!question.trim() && !imageFile) return;
    setLoading(true);

    const userMessage: Message = {
      role: "user",
      text: question,
      imagePreview: imagePreview || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

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
        body: JSON.stringify({
          question,
          imageBase64,
          imageMediaType,
          profile,
        }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer || data.error || "Keine Antwort erhalten." },
      ]);
    } catch (err) {
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

  if (!profile) return null;

  return (
    <main className="flex flex-col h-screen max-w-lg mx-auto">
      <header className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h1 className="font-semibold">Travelino</h1>
          <p className="text-xs text-neutral-500">Unawatuna · dein lokaler Begleiter</p>
        </div>
        <span className="text-xs text-neutral-500">Hi, {profile.name || "Reisende(r)"}</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-neutral-500 text-sm mt-8 text-center px-6">
            Mach ein Foto von einer Speisekarte, einem Preisschild oder
            beschreib eine Situation – ich sag dir direkt, was ich an deiner
            Stelle tun würde.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-neutral-900 border border-neutral-800"
              }`}
            >
              {m.imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.imagePreview}
                  alt="Upload"
                  className="rounded-lg mb-2 max-h-48"
                />
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
                handleSend();
              }
            }}
            placeholder="Frag mich irgendwas..."
            rows={1}
            className="flex-1 rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="shrink-0 w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 flex items-center justify-center"
            aria-label="Senden"
          >
            ➤
          </button>
        </div>
      </div>
    </main>
  );
}
