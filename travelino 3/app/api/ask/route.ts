import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, UserProfile } from "@/lib/systemPrompt";

// WICHTIG: ANTHROPIC_API_KEY muss als Environment Variable in Vercel gesetzt
// werden (Projekt-Settings -> Environment Variables), nicht hier im Code.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, imageBase64, imageMediaType, profile } = body as {
      question: string;
      imageBase64?: string; // optional: Base64-kodiertes Foto (ohne data:-Prefix)
      imageMediaType?: string; // z.B. "image/jpeg"
      profile: UserProfile;
    };

    if (!question && !imageBase64) {
      return NextResponse.json(
        { error: "Bitte Frage oder Foto mitschicken." },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(profile || {});

    // Nachricht zusammenbauen: Text + optional Bild
    const contentBlocks: Anthropic.MessageParam["content"] = [];

    if (imageBase64 && imageMediaType) {
      contentBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: imageMediaType as
            | "image/jpeg"
            | "image/png"
            | "image/gif"
            | "image/webp",
          data: imageBase64,
        },
      });
    }

    contentBlocks.push({
      type: "text",
      text: question || "Was siehst du auf diesem Foto? Gib mir deine Einschätzung.",
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: contentBlocks,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const answer = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("Travelino API error:", err);
    return NextResponse.json(
      { error: "Etwas ist schiefgelaufen. Bitte nochmal versuchen." },
      { status: 500 }
    );
  }
}
