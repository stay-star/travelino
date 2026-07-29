# Travelino – V0

Die erste testbare Version: eine Seite, ein Feature. Foto oder Frage rein,
personalisierte, klare Entscheidung raus. Zugeschnitten auf Unawatuna, Sri
Lanka.

## Was du brauchst (alles kostenlos, außer API-Nutzung)

1. Ein GitHub-Konto: https://github.com
2. Ein Vercel-Konto: https://vercel.com (mit GitHub verknüpfen)
3. Einen Anthropic API-Key: https://console.anthropic.com
   (Account erstellen → "API Keys" → neuen Key erstellen. Du lädst dort
   etwas Guthaben auf, z.B. 5-10 $ reichen für sehr viele Tests.)

## Schritt für Schritt: Online bringen

### 1. Code zu GitHub hochladen
- Erstelle ein neues, leeres Repository auf GitHub (z.B. "travelino").
- Lade den kompletten Inhalt dieses Ordners dort hoch (entweder per
  GitHub-Weboberfläche "Upload files", oder falls du/ein Bekannter Git
  kennt: `git init`, `git add .`, `git commit -m "erste Version"`,
  `git remote add origin <dein-repo-link>`, `git push -u origin main`).

### 2. Bei Vercel importieren
- Auf vercel.com einloggen, "Add New Project" → dein GitHub-Repo auswählen.
- Vercel erkennt automatisch, dass es ein Next.js-Projekt ist.
- **Wichtig:** Bevor du auf "Deploy" klickst, bei "Environment Variables"
  hinzufügen:
  - Name: `ANTHROPIC_API_KEY`
  - Wert: dein Anthropic API-Key
- Auf "Deploy" klicken. Nach 1-2 Minuten ist die App live unter einer
  Adresse wie `travelino.vercel.app`.

### 3. Testen
- Öffne die Vercel-URL auf deinem Handy.
- Durchlaufe das Onboarding.
- Mach ein Foto von einer Speisekarte oder frag etwas.

## Was als Nächstes kommt (nicht jetzt, aber geplant)

- Nutzerprofil in Supabase speichern statt nur im Browser (localStorage) -
  damit Profile über Geräte hinweg erhalten bleiben.
- Trip-Gedächtnis (vector search über frühere Antworten).
- QR-Code-Landingpage speziell fürs Hostel.

## Falls etwas nicht funktioniert

Häufigste Fehlerquelle: der `ANTHROPIC_API_KEY` fehlt oder ist falsch in
den Vercel Environment Variables eingetragen. Nach dem Hinzufügen/Ändern
einer Environment Variable muss in Vercel unter "Deployments" ein Redeploy
angestoßen werden, sonst greift die Änderung nicht.
