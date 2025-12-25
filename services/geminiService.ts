
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GameActionResponse, GameState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are a master Dungeon Master for "Chronicles of Aetheria", a dark, immersive fantasy RPG.
Your goal is to provide evocative, atmospheric storytelling based on player actions.

Rules:
1. Keep narrative descriptions under 150 words.
2. Be descriptive but maintain a sense of mystery and danger.
3. Every response MUST include:
   - Narrative story text.
   - A short, vivid prompt (15-20 words) for an image generator representing the current scene.
   - Mechanical updates for health, mana, and inventory.
4. Players start in the "Echoing Crypts".
5. Use the provided JSON schema for responses.
`;

export async function processGameAction(
  action: string,
  state: GameState
): Promise<GameActionResponse> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Current State: ${JSON.stringify(state)}
    Player Action: ${action}
    
    Respond with the next part of the story and mechanical updates.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          narrative: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          healthChange: { type: Type.INTEGER },
          manaChange: { type: Type.INTEGER },
          newInventoryItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          lostInventoryItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          location: { type: Type.STRING },
        },
        required: ["narrative", "imagePrompt", "healthChange", "manaChange", "newInventoryItems", "lostInventoryItems", "location"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as GameActionResponse;
}

export async function generateSceneImage(prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Dark fantasy cinematic style: ${prompt}. Highly detailed, 4k, moody lighting, atmospheric.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed", error);
    return null;
  }
}
