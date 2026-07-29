"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DIET_OPTIONS = [
  "Vegetarisch",
  "Vegan",
  "Glutenfrei",
  "Erdnussallergie",
  "Meeresfrüchte-Allergie",
  "Laktoseintoleranz",
  "Halal",
];

export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [homeCountry, setHomeCountry] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [experience, setExperience] = useState<
    "erste_reise" | "erfahren" | "vielreisend"
  >("erfahren");

  function toggleDiet(item: string) {
    setDiet((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  }

  function handleSubmit() {
    const profile = {
      name,
      homeCountry,
      dietaryRestrictions: diet,
      travelExperience: experience,
    };
    localStorage.setItem("travelino_profile", JSON.stringify(profile));
    router.push("/");
  }

  return (
    <main className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-1">Willkommen bei Travelino</h1>
      <p className="text-neutral-400 mb-8">
        Ein paar kurze Fragen, damit jede Antwort auf dich zugeschnitten ist.
      </p>

      <label className="block mb-4">
        <span className="text-sm text-neutral-400">Dein Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 focus:outline-none focus:border-brand-500"
          placeholder="Max"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-neutral-400">Herkunftsland</span>
        <input
          value={homeCountry}
          onChange={(e) => setHomeCountry(e.target.value)}
          className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 focus:outline-none focus:border-brand-500"
          placeholder="Deutschland"
        />
      </label>

      <div className="block mb-4">
        <span className="text-sm text-neutral-400">
          Worauf sollen wir bei dir achten? (optional)
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {DIET_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => toggleDiet(option)}
              type="button"
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                diet.includes(option)
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "border-neutral-700 text-neutral-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="block mb-8">
        <span className="text-sm text-neutral-400">Wie erfahren bist du als Reisende(r)?</span>
        <div className="mt-2 flex gap-2">
          {[
            { key: "erste_reise", label: "Erste große Reise" },
            { key: "erfahren", label: "Erfahren" },
            { key: "vielreisend", label: "Vielreisend" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setExperience(opt.key as typeof experience)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border transition ${
                experience === opt.key
                  ? "bg-brand-600 border-brand-600 text-white"
                  : "border-neutral-700 text-neutral-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full rounded-lg bg-brand-600 hover:bg-brand-500 transition py-3 font-medium"
      >
        Los geht's
      </button>
    </main>
  );
}
