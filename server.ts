import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON parsing with limit to prevent payload errors for base64 images
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize Google GenAI client lazily or safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function getAiClient(): GoogleGenAI {
  if (!ai) {
    const freshKey = process.env.GEMINI_API_KEY;
    if (!freshKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets or .env file.");
    }
    ai = new GoogleGenAI({
      apiKey: freshKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// REST route for health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Route for identifying plant from photo
app.post("/api/identify", async (req, res) => {
  try {
    const { image, mimeType } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: "Missing required fields: image and mimeType." });
    }

    const client = getAiClient();

    const result = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: image,
          },
        },
        {
          text: "Identify the plant in this image and provide a highly detailed, professional care profile. If the image is not a plant, set isPlant: false. Be highly specific with scientific naming and actionable watering levels (1 to 5: 1 is xerophytic, 5 is bog-loving/constantly moist), sunlight levels (1 to 5: 1 is deep shade, 5 is direct blazing sun), and humidity levels (1 to 5).",
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPlant: {
              type: Type.BOOLEAN,
              description: "Must be true if the image depicts a plant, tree, shrub, flower, seedling, succulent, or vegetation. Set to false if the image clearly is not a plant (e.g., people, cars, random household objects, text).",
            },
            name: {
              type: Type.STRING,
              description: "The common name of the plant. If isPlant is false, use 'Unknown Object'.",
            },
            scientificName: {
              type: Type.STRING,
              description: "The botanical/scientific name of the plant with proper genus and species capitalization, e.g., 'Spathiphyllum wallisii'. Empty string if not a plant.",
            },
            description: {
              type: Type.STRING,
              description: "A friendly, elegant 2-3 sentence overview highlighting the plant's natural habitat, foliage traits, and care personality.",
            },
            difficulty: {
              type: Type.STRING,
              enum: ["Easy", "Moderate", "Expert"],
              description: "Care difficulty rating based on the plant's resilience to neglect and requirements.",
            },
            careStats: {
              type: Type.OBJECT,
              properties: {
                sunlight: {
                  type: Type.STRING,
                  description: "Summary sunlight requirements, e.g., 'Moderate to bright indirect sunlight. Avoid direct afternoon rays.'",
                },
                sunlightLevel: {
                  type: Type.INTEGER,
                  description: "Numerical value from 1 to 5 indicating intensity needed (1: direct shade/low light, 3: bright indirect, 5: direct full sun).",
                },
                watering: {
                  type: Type.STRING,
                  description: "Watering schedule guidance, e.g., 'Water deep when the top 2 inches of soil are dry. Usually every 7-10 days.'",
                },
                wateringLevel: {
                  type: Type.INTEGER,
                  description: "Numerical watering level (1: dry/desert cactus, 3: standard evenly draining moist-dry, 5: water-submerged/bog).",
                },
                soilType: {
                  type: Type.STRING,
                  description: "Perfect potting soil mixture recommendation, e.g., 'Well-draining indoor potting mix boosted with pumice and perlite.'",
                },
                humidity: {
                  type: Type.STRING,
                  description: "Ambient humidity needs, e.g., 'Prefers higher humidity (50%+). Mist daily or place near humidifier.'",
                },
                humidityLevel: {
                  type: Type.INTEGER,
                  description: "Numerical level (1: dry desert breeze, 3: standard room ambient, 5: dripping mist/terrarium).",
                },
                temperature: {
                  type: Type.STRING,
                  description: "Comfortable growing temperature range in Fahrenheit and Celsius, e.g., '65°F - 80°F (18°C - 27°C). Protect from cold drafts.'",
                },
              },
              required: ["sunlight", "sunlightLevel", "watering", "wateringLevel", "soilType", "humidity", "humidityLevel", "temperature"],
            },
            careInstructions: {
              type: Type.OBJECT,
              properties: {
                wateringTips: {
                  type: Type.STRING,
                  description: "High-quality actionable advice on how to water (e.g. bottom-watering, checking moisture with finger, seasonal adjustments).",
                },
                sunlightTips: {
                  type: Type.STRING,
                  description: "Pro tips on orientation (East/West window), rotating the plant, and signs of sunburn or low light stretching.",
                },
                feedingTips: {
                  type: Type.STRING,
                  description: "When and how to feed (e.g. liquid fertilizer monthly in spring/summer, dilute by half, avoid winter feeding).",
                },
                pruningTips: {
                  type: Type.STRING,
                  description: "Maintenance checklist: wiping dust off broad leaves, removing yellowing lower foliage, cutting back leggy stems.",
                },
              },
              required: ["wateringTips", "sunlightTips", "feedingTips", "pruningTips"],
            },
            commonIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  issue: { type: Type.STRING, description: "Common problem name, e.g. Root Rot, Spider Mites, Brown Leaf Tips." },
                  symptom: { type: Type.STRING, description: "Visual sign the grower will spot on the plant." },
                  solution: { type: Type.STRING, description: "A simple, clear recipe of actions to cure the issue." },
                },
                required: ["issue", "symptom", "solution"],
              },
              description: "Produce exactly 2-3 common problems this species encounters.",
            },
            propagation: {
              type: Type.OBJECT,
              properties: {
                method: {
                  type: Type.STRING,
                  description: "Best way to propagate, e.g., Stem cuttings, Leaf cuttings, Root division.",
                },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Precise, numbered instruction steps.",
                },
              },
              required: ["method", "steps"],
            },
          },
          required: ["isPlant", "name", "scientificName", "description", "difficulty", "careStats", "careInstructions", "commonIssues", "propagation"],
        },
      },
    });

    const parsedData = JSON.parse(result.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error identifying plant:", error);
    res.status(500).json({
      error: "Failed to identify plant. Please make sure your Gemini API key is valid.",
      details: error.message || String(error),
    });
  }
});

// Route for follow-up chat with Flora, the care coach
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, currentPlantContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const client = getAiClient();

    const chatPrompt = `You are "Flora", a warm, enthusiastic botanical expert and home gardening coach. You are holding a conversation with a plant parent.

Active Plant Context:
${currentPlantContext ? JSON.stringify(currentPlantContext) : "The user is asking a general home gardening, houseplant care, or landscape plants question."}

Conversation History so far:
${history && history.length > 0 ? history.map((msg: any) => `${msg.sender === "user" ? "User" : "Flora"}: ${msg.text}`).join("\n") : "No previous conversation history."}

User: ${message}

Flora: (provide a 2-4 sentence, friendly, highly tailored response. Be encouraging! Tell them exactly what to do using practical steps, keeping in mind the plant details if applicable. Do not use markdown headers, just clean text responses.)`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatPrompt,
      config: {
        systemInstruction: "You are Flora, a warm, positive, knowledgeable botanical coach. Provide highly supportive, accurate, and actionable plant care guidance.",
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error conversing with Flora:", error);
    res.status(500).json({
      error: "Flora encountered a greenhouse error.",
      details: error.message || String(error),
    });
  }
});

async function run() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Greenhouse dashboard running at http://0.0.0.0:${PORT}`);
  });
}

run().catch((err) => {
  console.error("Failed to start plant server:", err);
});
