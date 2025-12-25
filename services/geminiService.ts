import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, Question, PostType } from "../types";
import { EXAM_PATTERNS } from "../constants";

const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateQuizQuestions = async (config: QuizConfig): Promise<Question[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API configuration missing. Please ensure your environment is set up correctly.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let modeSpecificPrompt = "";

  if (config.mode === 'exam') {
      modeSpecificPrompt = `MODE: FULL EXAM SIMULATION for ${config.post}. Follow standard weightage.`;
  } else {
      modeSpecificPrompt = `MODE: SUBJECT PRACTICE. Subject: ${config.subject}. Topic: ${config.topic || 'General'}.`;
  }

  const pyqInstruction = config.isPYQ 
    ? `MANDATORY: You are in PREVIOUS YEAR QUESTIONS (PYQ) mode. 
       1. Use the Google Search tool to find actual questions from AP DSC (2018, 2024), TET, or TRT papers.
       2. For every question, you MUST provide the 'sourceExam' (e.g., "AP DSC SGT") and 'sourceYear' (e.g., "2018").
       3. If a question is a high-fidelity recreation of a known pattern, state "Syllabus Pattern" in sourceExam.`
    : `Include 'sourceExam' and 'sourceYear' if the question is inspired by a specific previous year pattern (e.g. "AP DSC Model" / "2024").`;

  const systemInstruction = `You are an expert AP DSC Examiner.
  Generate ${config.questionCount} MCQs for ${config.post} in ${config.language}.
  
  ${modeSpecificPrompt}
  ${pyqInstruction}

  CURRENT AFFAIRS (GK): Strictly focus on 2024-2025 events for GK sections.

  CRITICAL VISUAL PROMPT: Describe a textbook-style diagram for the 'visualPrompt' field. Labels MUST be in English font.
  
  Language: ${config.language}.
  Difficulty: ${config.difficulty}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate ${config.questionCount} JSON MCQs for AP DSC. ${config.isPYQ ? 'PRIORITIZE REAL PREVIOUS QUESTIONS.' : ''}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
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
              section: { type: Type.STRING },
              sourceExam: { type: Type.STRING, description: "The specific exam where this question appeared (e.g., AP DSC SA)" },
              sourceYear: { type: Type.STRING, description: "The year of the exam (e.g., 2018)" }
            },
            required: ["questionText", "options", "correctAnswerIndex", "explanation", "additionalInfo", "visualPrompt", "sourceExam", "sourceYear"]
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
      section: item.section,
      sourceExam: item.sourceExam,
      sourceYear: item.sourceYear
    }));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate questions. The exam patterns might be undergoing maintenance. Try again.");
  }
};

export const generateIllustrativeImage = async (visualPrompt: string, language?: string): Promise<string> => {
  if (!process.env.API_KEY) return "";
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const finalPrompt = `Professional educational diagram: ${visualPrompt}. English labels, textbook style.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ text: finalPrompt }] },
      config: { imageConfig: { aspectRatio: "4:3" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (error) { console.error("Image generation failed:", error); }
  return "";
};