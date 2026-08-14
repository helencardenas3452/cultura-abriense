import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "PURO - Refugio Emocional" });
  });

  // 1. Socratic Question Generator for Etéreo (Emotional Flask & User Note Analysis)
  app.post("/api/socratic-question", async (req, res) => {
    try {
      const { emotions, note } = req.body;
      const ai = getGenAI();

      const userNote = typeof note === 'string' ? note.trim() : '';

      if (!ai) {
        // Fallback response if no API key is provided
        if (userNote.length > 0) {
          return res.json({
            question: `Al releer lo que has escrito ("${userNote.slice(0, 35)}..."), ¿qué verdad más profunda está buscando un espacio de paz en tu pecho?`,
            source: "fallback"
          });
        }
        return res.json({
          question: "Observa las emociones que has depositado. ¿Qué necesidad oculta o anhelo de paz te está revelando tu cuerpo hoy?",
          source: "fallback"
        });
      }

      const emotionSummary = Array.isArray(emotions) && emotions.length > 0
        ? emotions.map((e: any) => `${e.name} (intensidad ${e.intensity}/5)`).join(", ")
        : "un frasco en calma o vacío";

      let prompt = '';
      if (userNote.length > 0) {
        prompt = `Actúa como el 'Espejo Socrático' de PURO, un refugio emocional guiado por la filosofía de la Tecnología Serena (Calm Technology) y la mayéutica compasiva.
El usuario ha vertido en su frasco emocional las siguientes emociones: ${emotionSummary}.
Y ha escrito la siguiente nota o reflexión personal en su frasco:
"""
${userNote}
"""

Analiza con profunda sensibilidad humana, empatía y mayéutica socrática el texto de esta nota y las emociones seleccionadas.
Genera UNA ÚNICA PREGUNTA reflexiva, personalizada, poética y libre de juicios que ayude al usuario a profundizar en la raíz emocional de lo que ha expresado en su nota, iluminando lo que aún no ha sido nombrado con ternura y consciencia.
Reglas:
- Máximo 2 oraciones breves.
- Debe conectar sutilmente con los matices de la nota que escribió el usuario.
- Tono: poético, cálido, filosófico, sin jerga clínica, consejos moralistas ni juicios.
- Idioma: Español.
- No incluyas saludos, comillas exteriores, ni preámbulos. Solo la pregunta directa.`;
      } else {
        prompt = `Actúa como el 'Espejo Socrático' de PURO, un refugio emocional guiado por la filosofía de la Tecnología Serena (Calm Technology) y la mayéutica compasiva.
El usuario ha vertido en su frasco emocional la siguiente combinación de sentires:
${emotionSummary}.

Genera UNA ÚNICA PREGUNTA reflexiva, poética, profunda y libre de juicios que invite al usuario a explorar su mundo interior con ternura y consciencia.
Reglas:
- Máximo 2 oraciones.
- Tono: poético, cálido, minimalista, sin jerga de autoayuda agresiva ni consejos clínicos.
- Idioma: Español.
- No añadas saludos, ni comillas extra, ni encabezados. Solo la pregunta directa.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres el Espejo Socrático de PURO, formulando preguntas breves, poéticas y conmovedoras que invitan a la introspección serena a partir de las emociones y notas del usuario.",
          temperature: 0.7,
        }
      });

      const questionText = response.text?.trim() || "¿Qué espacio de silencio necesita tu sentir en este instante?";
      return res.json({ 
        question: questionText, 
        source: "gemini",
        analyzedNote: userNote.length > 0
      });
    } catch (error) {
      console.error("Error generating socratic question:", error);
      return res.json({
        question: "¿Qué mensaje silencioso trae esta combinación de sentires a tu presente?",
        source: "fallback"
      });
    }
  });

  // 2. Sie Introspective Conversation & Ritual Recommender
  app.post("/api/sie/chat", async (req, res) => {
    try {
      const { messages, currentEmotions } = req.body;
      const ai = getGenAI();

      const lastUserMessage = messages?.[messages.length - 1]?.text || "";

      if (!ai) {
        // Serene heuristic fallback
        return res.json({
          reply: "Escucho el murmullo de tus pensamientos. A veces, simplemente respirar y aceptar lo que está presente es el mayor acto de ternura. ¿Qué necesitarías soltar en este instante?",
          suggestedRitualId: undefined,
          source: "fallback"
        });
      }

      const emotionsContext = Array.isArray(currentEmotions) && currentEmotions.length > 0
        ? `Estado anímico en el frasco: ${currentEmotions.map((e: any) => e.name).join(", ")}.`
        : "";

      const historyFormatted = (messages || []).slice(-6).map((m: any) => 
        `${m.sender === 'user' ? 'Usuario' : 'Sie'}: ${m.text}`
      ).join("\n");

      const prompt = `Eres Sie, el guía y acompañante introspectivo del refugio emocional 'PURO'.
Tu voz es pausada, empática, compasiva y profundamente serena. Practicas la escucha activa y la mayéutica socrática suave. Nunca juzgas, nunca diagnosticas clínicamente, y nunca ofreces soluciones mágicas ni frases hechas.
${emotionsContext}

Historial de conversación reciente:
${historyFormatted}

Rituales disponibles en PURO que puedes sugerir (SOLO si es genuinamente pertinente para el estado anímico):
- 'arraigo-5min' (Para ansiedad, dispersión o estrés: contacto con los sentidos y tierra)
- 'desahogo-escrito' (Para tristeza, enojo o pensamientos en bucle: catarsis escrita)
- 'respiracion-cuadrada' (Para buscar calma, concentración o equilibrio 4-4-4-4)
- 'cierre-nocturno' (Para insomnio, fatiga mental o entregar las cargas al final del día)

Devuelve tu respuesta en formato JSON estrictamente válido con esta estructura:
{
  "reply": "Tu mensaje reflexivo, cálido y conciso en español (máximo 3-4 oraciones breves).",
  "suggestedRitualId": "id_del_ritual_o_null"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres Sie, guía sereno en PURO. Responde siempre con brevedad poética y empatía genuina en formato JSON.",
          responseMimeType: "application/json",
          temperature: 0.6,
        }
      });

      const rawText = response.text?.trim();
      let parsed = { reply: "", suggestedRitualId: null };
      try {
        parsed = JSON.parse(rawText || "{}");
      } catch {
        parsed = {
          reply: rawText || "Escucho la profundidad de tus palabras. Respira hondo y date el permiso de sentir sin prisa.",
          suggestedRitualId: null
        };
      }

      return res.json({
        reply: parsed.reply || "Estoy aquí sosteniendo este espacio contigo. ¿Hacia dónde te gustaría llevar tu respiración ahora?",
        suggestedRitualId: parsed.suggestedRitualId || undefined,
        source: "gemini"
      });
    } catch (error) {
      console.error("Error in Sie chat endpoint:", error);
      return res.json({
        reply: "Escucho lo que compartes. A veces el silencio y una exhalación profunda son el mejor refugio.",
        suggestedRitualId: undefined,
        source: "fallback"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PURO Server running on http://localhost:${PORT}`);
  });
}

startServer();
