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
      // Logic to calculate distribution based on total Question Count requested
      const pattern = EXAM_PATTERNS[config.post];
      const totalWeight = pattern.reduce((sum, p) => sum + p.weight, 0);
      const scalingFactor = config.questionCount / totalWeight;

      const distribution = pattern.map(p => {
          // Calculate questions for this section
          let count = Math.round(p.weight * scalingFactor);
          // Ensure at least 1 question if weight > 0, unless scaling is extremely small
          if (count === 0 && p.weight > 0 && config.questionCount > 10) count = 1;
          
          // Rename 'Content' and 'Methodology' with specific subject if applicable
          let sectionName = p.section;
          if (p.isContent && config.subject) sectionName = `${config.subject} (Content)`;
          if (p.isMethodology && config.subject) sectionName = `${config.subject} (Methodology)`;

          return { name: sectionName, count };
      }).filter(d => d.count > 0);

      // Adjust total if rounding caused mismatch
      const calculatedTotal = distribution.reduce((sum, d) => sum + d.count, 0);
      const diff = config.questionCount - calculatedTotal;
      if (diff !== 0 && distribution.length > 0) {
          // Add/remove difference from the largest section (usually Content)
          distribution.sort((a, b) => b.count - a.count);
          distribution[0].count += diff;
      }

      promptDetails = `
      MODE: FULL EXAM SIMULATION
      You must generate exactly ${config.questionCount} questions following this STRICT distribution based on the AP DSC ${config.post} Exam Pattern:
      ${distribution.map(d => `- ${d.name}: ${d.count} questions`).join('\n')}
      `;
  } else {
      // Practice Mode
      promptDetails = `
      MODE: SUBJECT PRACTICE
      Subject: ${config.subject}.
      Topic: ${config.topic || 'General Syllabus Mix'}.
      Count: ${config.questionCount} questions.
      `;
  }


  // Detailed instruction for diverse authentic formats
  const systemInstruction = `You are an expert exam setter for the Andhra Pradesh DSC (District Selection Committee) and Teacher Recruitment Test (TRT). 
  
  Your task is to generate high-quality multiple-choice questions for the post of ${config.post}.
  
  ${promptDetails}

  CRITICAL INSTRUCTION ON QUESTION TYPES:
  You must randomly select different authentic question types. Do NOT generate only direct questions.
  Required Types (mix these):
  1. Direct Questions.
  2. Assertion (A) and Reason (R).
  3. Match the Following.
  4. Multi-Statement (True/False).
  5. Chronological Order.

  CRITICAL FORMATTING INSTRUCTION:
  Use newline characters (\\n) in the 'questionText' to separate Assertion/Reason, Lists, or Statements so they are displayed clearly.

  CRITICAL LANGUAGE INSTRUCTION:
  The user has requested the questions in the following language: ${config.language}.
  You MUST output the 'questionText', 'options', 'explanation', and 'additionalInfo' values in ${config.language}.
  However, the JSON KEYS and 'section' MUST remain in English.
  
  CRITICAL VISUAL PROMPT INSTRUCTION (Read Carefully):
  'visualPrompt' is used to generate an image.
  1. If the image requires specific text labels (e.g., labels on a diagram, text on a board), YOU MUST INCLUDE THE ACTUAL ${config.language} WORDS in the prompt.
  2. Example (if Language is Telugu): "A diagram of a flower with the label 'పువ్వు' (Flower) pointing to the petals."
  3. Example (if Language is Hindi): "An image of the sun labeled 'सूर्य'."
  4. The image generator needs the specific characters to render the text correctly in ${config.language}.
  
  Difficulty Level: ${config.difficulty}.
  ${config.isPYQ ? 'IMPORTANT: Prioritize questions that have appeared in previous AP DSC/TRT years.' : ''}
  `;

  const prompt = `Generate ${config.questionCount} MCQs for ${config.post}. Return valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: {
                type: Type.STRING,
                description: `The question text in ${config.language}.`
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `An array of exactly 4 options in ${config.language}.`,
                minItems: 4,
                maxItems: 4
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description: "The zero-based index of the correct option (0, 1, 2, or 3)."
              },
              explanation: {
                type: Type.STRING,
                description: `Detailed explanation in ${config.language}.`
              },
              additionalInfo: {
                type: Type.STRING,
                description: `Extra context in ${config.language}.`
              },
              visualPrompt: {
                type: Type.STRING,
                description: `Image prompt. Include actual ${config.language} text for labels.`
              },
              section: {
                type: Type.STRING,
                description: "The section name (e.g. GK, Psychology, Content). Important for Exam Mode."
              }
            },
            required: ["questionText", "options", "correctAnswerIndex", "explanation", "additionalInfo", "visualPrompt"]
          }
        }
      }
    });

    const rawData = response.text;
    if (!rawData) {
      throw new Error("No data received from Gemini API.");
    }

    const parsedData = JSON.parse(rawData);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    throw new Error("Failed to generate questions. Please try again.");
  }
};

export const generateIllustrativeImage = async (visualPrompt: string, language: string = 'English'): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "";

  const ai = new GoogleGenAI({ apiKey });

  // Use the specific language requested
  const prompt = `Create a high-quality, educational textbook illustration based on this description:
  "${visualPrompt}"
  
  CRITICAL TEXT RENDERING INSTRUCTIONS:
  1. The description contains text or labels in the ${language} language/script.
  2. Render the specific ${language} characters EXACTLY as described in the prompt.
  3. Do NOT translate the text into English unless explicitly asked.
  4. Ensure the script is legible, bold, and accurately formed.
  
  Style: White background, clear lines, high contrast, clean educational style.`;

  // Attempt 1: Try using Imagen 3 model (via 'imagen-4.0-generate-001') for superior text rendering
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3', // Standard aspect ratio for textbook diagrams
        outputMimeType: 'image/jpeg',
      },
    });

    const base64EncodeString = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64EncodeString) {
      return `data:image/jpeg;base64,${base64EncodeString}`;
    }
  } catch (error) {
    console.warn("Imagen generation failed (likely due to access or quota), falling back to Gemini Flash Image:", error);
  }

  // Attempt 2: Fallback to Gemini 2.5 Flash Image if Imagen fails
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Fallback Image Gen Error:", error);
  }

  return "";
};