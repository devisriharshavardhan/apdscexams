
import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, Question, PostType } from "../types";
import { EXAM_PATTERNS } from "../constants";

const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateQuizQuestions = async (config: QuizConfig): Promise<Question[]> => {
  // Ensure we check for API_KEY availability
  if (!process.env.API_KEY) {
    throw new Error("Subscriber authentication required. Please select your API key.");
  }

  // Always create a new instance to use the most recent key from the environment directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

  const systemInstruction = `You are a world-class educational examiner specialized in the Andhra Pradesh DSC/TRT syllabus.
  Generate ${config.questionCount} high-quality MCQs for ${config.post} in ${config.language}.
  
  ${promptDetails}

  CRITICAL VISUAL PROMPT RULE:
  The 'visualPrompt' field will be used by an advanced image generator.
  - Describe a professional, clear educational diagram.
  - MANDATORY: All labels in the image prompt must be in ENGLISH font for perfect legibility.
  - Example: "A cross-section of a volcano with labels 'Magma Chamber', 'Vent', and 'Crater' in clear English sans-serif font."
  
  Language of Question/Options: ${config.language}.
  Difficulty: ${config.difficulty}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
              visualPrompt: { type: Type.STRING },
              section: { type: Type.STRING }
            },
            required: ["questionText", "options", "correctAnswerIndex", "explanation", "additionalInfo", "visualPrompt"]
          }
        },
        thinkingConfig: { thinkingBudget: 2000 }
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
  } catch (error: any) {
    // Handle the specific "Requested entity was not found" error as per guidelines to signal re-authentication
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("Subscriber session expired. Please re-authenticate your API key.");
    }
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate questions. Ensure your subscriber key is active.");
  }
};

/**
 * Generates an illustrative image using Gemini 3 Pro Image.
 * Fix for QuizPlayer.tsx line 128: Added optional language parameter to signature.
 * Fix: Always using process.env.API_KEY directly for GoogleGenAI initialization.
 */
export const generateIllustrativeImage = async (visualPrompt: string, language?: string): Promise<string> => {
  if (!process.env.API_KEY) return "";

  // Always create a new instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const finalPrompt = `Premium educational diagram for ${language || 'English'} medium syllabus: ${visualPrompt}. 
  Mandatory Requirements:
  1. All text labels must be in clear, readable English font.
  2. Professional textbook aesthetic, white background.
  3. Precise vectors, high contrast, minimalist colors.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: finalPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        }
      },
    });

    // Iterate through candidates and parts to find the inlineData (image bytes)
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("High-quality image generation failed:", error);
  }

  return "";
};
