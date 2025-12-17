import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, Question, PostType } from "../types";
import { EXAM_PATTERNS } from "../constants";

const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateQuizQuestions = async (config: QuizConfig): Promise<Question[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  let promptDetails = "";

  if (config.mode === 'exam') {
      const pattern = EXAM_PATTERNS[config.post];
      const totalWeight = pattern.reduce((sum, p) => sum + p.weight, 0);
      const scalingFactor = config.questionCount / totalWeight;

      const distribution = pattern.map(p => {
          let count = Math.round(p.weight * scalingFactor);
          if (count === 0 && p.weight > 0 && config.questionCount > 10) count = 1;
          
          let sectionName = p.section;
          if (p.isContent && config.subject) sectionName = `${config.subject} (Content)`;
          if (p.isMethodology && config.subject) sectionName = `${config.subject} (Methodology)`;

          return { name: sectionName, count };
      }).filter(d => d.count > 0);

      const calculatedTotal = distribution.reduce((sum, d) => sum + d.count, 0);
      const diff = config.questionCount - calculatedTotal;
      if (diff !== 0 && distribution.length > 0) {
          distribution.sort((a, b) => b.count - a.count);
          distribution[0].count += diff;
      }

      promptDetails = `
      MODE: FULL EXAM SIMULATION
      Distribution:
      ${distribution.map(d => `- ${d.name}: ${d.count}`).join('\n')}
      `;
  } else {
      promptDetails = `
      MODE: SUBJECT PRACTICE
      Subject: ${config.subject}.
      Topic: ${config.topic || 'General Syllabus Mix'}.
      Count: ${config.questionCount} questions.
      `;
  }

  const systemInstruction = `You are an expert exam setter for AP DSC/TRT.
  Generate ${config.questionCount} MCQs for ${config.post} in ${config.language}.
  
  ${promptDetails}

  CRITICAL VISUAL PROMPT RULE:
  The 'visualPrompt' field will be used by an image generator. 
  1. Describe a clear educational diagram.
  2. Specify exactly which labels to draw in ${config.language} script.
  3. Example for Telugu: "A diagram of a tree with labels in Telugu script: 'వేరు' (Root), 'కాండము' (Stem), 'ఆకు' (Leaf)."
  4. DO NOT include meta-instructions like "Render this" or "Critical" in the visualPrompt itself. Just the scene and label list.
  
  Difficulty: ${config.difficulty}. Language: ${config.language}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${config.questionCount} JSON MCQs for AP DSC ${config.post} in ${config.language}.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              additionalInfo: { type: Type.STRING },
              visualPrompt: { type: Type.STRING, description: "Scene description + labels in native script." },
              section: { type: Type.STRING }
            },
            required: ["questionText", "options", "correctAnswerIndex", "explanation", "additionalInfo", "visualPrompt"]
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "[]");
    return parsedData.map((item: any) => ({
      id: generateId(),
      text: item.questionText,
      options: item.options,
      correctAnswerIndex: item.correctAnswerIndex,
      explanation: item.explanation,
      additionalInfo: item.additionalInfo,
      visualPrompt: item.visualPrompt,
      section: item.section
    }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate questions.");
  }
};

export const generateIllustrativeImage = async (visualPrompt: string, language: string = 'Telugu'): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "";

  // Use Gemini 3 Pro Image for the highest possible fidelity in rendering complex scripts
  const ai = new GoogleGenAI({ apiKey });

  const finalPrompt = `A high-quality educational illustration: ${visualPrompt}. 
  Mandatory requirement: All text labels must be clearly written in the native ${language} script as specified. 
  Style: Minimalist, clean white background, professional textbook style, no English text unless specified.`;

  try {
    // We attempt Gemini 3 Pro first as it supports the most advanced text rendering
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: finalPrompt }] },
      config: {
        imageConfig: { aspectRatio: "4:3", imageSize: "1K" }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.warn("Gemini 3 Pro Image failed, trying Imagen 4 fallback:", error);
    
    // Fallback to Imagen 4
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: { numberOfImages: 1, aspectRatio: '4:3', outputMimeType: 'image/jpeg' },
      });
      const bytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (bytes) return `data:image/jpeg;base64,${bytes}`;
    } catch (e) {
      console.error("All image generation paths failed:", e);
    }
  }

  return "";
};