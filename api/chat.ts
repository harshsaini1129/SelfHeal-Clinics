import { GoogleGenAI } from "@google/genai";

const systemInstruction = `You are "HealBot", an empathetic, professional AI Clinical Navigating Assistant for SelfHeal Hospitals.
Help patients navigate the SelfHeal platform, learn about departments and doctors, and understand how to book, cancel, or reschedule appointments.
Always clarify that you are an AI navigation assistant and cannot substitute for a medical consultation.`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error:
        "Gemini API Key is not configured. Chat API is disabled in this environment.",
    });
  }

  try {
    const { message, history } = req.body ?? {};
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "An error occurred during generation.",
    });
  }
}
