import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 3000;
const DEFAULT_HMR_PORT = 24678;
const HMR_PORT_ATTEMPTS = 5;

function listenWithFallback(
  app: express.Express,
  port: number,
  attempts = 5,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, "0.0.0.0", () => resolve(port));
    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE" && attempts > 0) {
        console.warn(`Port ${port} is in use; trying port ${port + 1}...`);
        resolve(listenWithFallback(app, port + 1, attempts - 1));
      } else {
        reject(err);
      }
    });
  });
}

async function createViteServerWithFallback(basePort: number) {
  for (let attempt = 0; attempt < HMR_PORT_ATTEMPTS; attempt += 1) {
    const port = basePort + attempt;
    try {
      console.log(`Trying Vite HMR port ${port}`);
      return await createViteServer({
        server: {
          middlewareMode: true,
          hmr: {
            protocol: "ws",
            port,
          },
        },
        appType: "spa",
      });
    } catch (err: any) {
      if (
        err?.code === "EADDRINUSE" ||
        /EADDRINUSE/.test(String(err?.message))
      ) {
        console.warn(
          `HMR port ${port} is already in use, trying port ${port + 1}...`,
        );
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    `Unable to bind Vite HMR to any port from ${basePort} to ${basePort + HMR_PORT_ATTEMPTS - 1}`,
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY is not set. API chat will be disabled.");
  }

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      apiKeyConfigured: !!apiKey,
      chatEnabled: !!ai,
    });
  });

  // API chat route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      if (!ai) {
        return res.status(503).json({
          error:
            "Gemini API Key is not configured. Chat API is disabled in this environment.",
        });
      }

      // Convert history to Gemini parts structure
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
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

      const systemInstruction = `You are "HealBot", an empathetic, professional, and highly knowledgeable AI Clinical Navigating Assistant for SelfHeal Hospitals.
Your primary role is to guide patients on how to navigate the SelfHeal online clinical platform, learn about specialities, discover our board-certified medical doctors, and execute appointments slot reservations, cancellations, and reschedules.

Below is the verified website navigation details and institutional knowledge you must use to respond:

1. HOW TO BOOK A SLOT (OUTPATIENT APPOINTMENT):
   - Patients can navigate to the "Book Appointment" tab from the navigation bar, or click "Book Now" in any doctor's profile on the "Find Doctors" list.
   - Authorization Note: To access or request outpatient cards, patients MUST sign in or register with their email under "Patient Card Registration" (Auth Gate is present on "Book Appointment" and "My Bookings" views).
   - Booking process: Select a Speciality/Department, choose a doctor, select an available date for that doctor, select an available timeslot, fill out name, phone, email, optional clinical description, and click "Confirm & Reserve Slot".
   - Upon successful reservation, their outpatient pass is issued automatically and they are redirected to their dashboard.

2. HOW TO VIEW, CANCEL, OR RESCHEDULE APPOINTMENTS:
   - First, the patient must be logged into their Patient Card account.
   - Once logged in, they can click their name/avatar in the top-right corner of the navigation bar to open the "My Account Dashboard" dropdown.
   - Click "My Outpatient Bookings" on the dropdown, or go directly to the "Track Outpatient Passes" view.
   - Under active passes:
     - To Cancel: Click the "Cancel Slot" (red X) button. This immediately prompts verification and deletes/cancels the reservation from our Firestore calendar.
     - To Reschedule: Click the "Reschedule Time" (calendar icon) button on the ticket, pick a new valid date (on the doctor's available days), choose a new slot, and click "Save Changes".

3. SPECIALIZED DEPARTMENTS & SERVICES:
   - Cardiology: LED BY Dr. Evelyn Ross (Johns Hopkins, Senior Consultant, fee $140, Mon/Tue/Thu/Fri) & Dr. Marcus Vance (Harvard, Interventional Specialist, fee $130, Mon/Wed/Fri). Services include ECG/EKG stress tests, Hypertension & Coronary audits, cardiac imaging.
   - Neurology: LED BY Dr. Helena Vance (Stanford MD/PhD, Chief Neurologist, fee $150, Tue/Wed/Thu) & Dr. Aarav Mehta (Columbia, Consultant, fee $110, Mon/Tue/Fri). Services include Stroke prevention, migraines and craniomaxillofacial pain care, epilepsy therapy, neurocognitive assessment.
   - Pediatrics: LED BY Dr. Sarah Jenkins (Yale, Lead Pediatric Practitioner, fee $100, Mon/Tue/Wed/Thu) & Dr. Kenji Tanaka (Kyoto Univ, Senior Associate, fee $95, Tue/Wed/Fri). Services include regular childhood booster vaccinations, developmental milestones checks, child-friendly waiting rooms & play pods.
   - Orthopedics: LED BY Dr. David Miller (UC San Francisco, Director of Orthopedics, fee $145, Mon/Thu/Fri). Services include Joint pain assessments, sports micro-arthroscopy reviews, orthopedic insole designing, and physical rehab clinics.
   - Dermatology: LED BY Dr. Sofia Al-Fayed (McGill, Chief Medical Dermatologist, fee $120, Tue/Thu/Fri). Services include Acne scar therapy, eczema, psoriasis management, preventative dermoscopy mole monitoring, gentle rejuvenative skin lasers.

4. VOICE & TONE DIRECTIONS:
   - Warm, empathetic, professional, clear, clinical, yet comforting.
   - Support navigation explicitly: Offer to direct them: explain what tabs to click, where the booking form parameters reside, or how the Patient Card dropdown lets them manage active booked items.
   - Disclaimer: Always clarify that you are an AI Navigation Assistant and cannot substitute for a medical consultation, but you can coordinate scheduling, locate doctor bios, fees, availability, or department resources. Include brief markdown formatting such as bold accent words and bulleted summaries so the response is very readable. If asked therapeutic or medical questions, guide them politely to book a slot with the correct department’s physician.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({
        error: error.message || "An error occurred during generation.",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const baseHmrPort = Number(process.env.HMR_PORT) || DEFAULT_HMR_PORT;
    console.log(`Starting dev server with HMR base port ${baseHmrPort}`);

    const vite = await createViteServerWithFallback(baseHmrPort);
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT_NUM = Number(process.env.PORT) || DEFAULT_PORT;
  const actualPort = await listenWithFallback(app, PORT_NUM);
  console.log(`Server running on port ${actualPort}`);
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
