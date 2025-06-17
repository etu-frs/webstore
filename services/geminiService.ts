
import { GoogleGenAI, GenerateContentResponse, Candidate, GroundingMetadata, GroundingChunk } from "g-genai-lib"; // Added Candidate, GroundingMetadata, GroundingChunk

// Ensure API_KEY is handled as per prompt. For local dev, you might use a .env file,
// but for the purpose of this exercise, we rely on process.env.API_KEY being set.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "Gemini API Key not found. AI features will be limited or unavailable. Ensure process.env.API_KEY is set."
  );
}

const TEXT_MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const IMAGE_MODEL_NAME = "imagen-3.0-generate-002";

export const generateProductDescription = async (
  productName: string,
  keywords: string[]
): Promise<string> => {
  if (!ai) {
    return "AI service is not initialized. Please check API Key configuration.";
  }
  try {
    const prompt = `Generate a concise and informative product description for a product named "${productName}". 
    The description should be 2-3 sentences and highlight its key features or benefits. 
    Incorporate these keywords if relevant: ${keywords.join(", ")}.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful AI copywriter specializing in e-commerce product descriptions."
        // Omit thinkingConfig to use default (enabled thinking) for higher quality
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating product description with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Failed to generate AI description for ${productName}. Error: ${errorMessage}`;
  }
};

export const searchRecentEvents = async (query: string): Promise<{ text: string; sources?: GroundingChunk[] }> => {
  if (!ai) {
    return { text: "AI service is not initialized for search.", sources: [] };
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate: Candidate | undefined = response.candidates?.[0];
    const groundingMetadata: GroundingMetadata | undefined = candidate?.groundingMetadata;
    const sources: GroundingChunk[] = groundingMetadata?.groundingChunks?.filter(chunk => chunk.web) || [];
    
    return { text: response.text, sources };

  } catch (error) {
    console.error("Error searching with Gemini and Google Search:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { text: `Failed to search: ${errorMessage}`, sources: [] };
  }
};

export const generateDreamGadgetImage = async (
  prompt: string,
  retries = 2, // Max 2 retries (total 3 attempts)
  delay = 1000  // Initial delay in ms
): Promise<string> => {
  if (!ai) {
    throw new Error("AI service is not initialized for image generation.");
  }

  try {
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL_NAME,
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }, // Changed to image/jpeg
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`; // Changed prefix to image/jpeg
    } else {
      // This is considered a successful API call but no image was returned.
      throw new Error("No image generated or image data is missing from the response.");
    }
  } catch (error) {
    const attemptNumber = 3 - retries; // 1st attempt, 2nd attempt, 3rd attempt
    console.error(`Error generating image (attempt ${attemptNumber}/3):`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Retry on 500 UNKNOWN or gRPC error code 6 (UNAVAILABLE)
    const isRetriableError = errorMessage.includes("500 UNKNOWN") || errorMessage.includes("error code: 6");

    if (retries > 0 && isRetriableError) {
      console.log(`Retrying image generation in ${delay / 1000}s... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Call recursively with one less retry and doubled delay (exponential backoff)
      return generateDreamGadgetImage(prompt, retries - 1, delay * 2);
    } else {
      // If no retries left, or not a retriable error, re-throw a consolidated error.
      const finalErrorMessage = `Failed to generate dream gadget image after ${attemptNumber} attempt(s). Last error: ${errorMessage}`;
      console.error(finalErrorMessage, error); // Log the original error object as well for full context
      throw new Error(finalErrorMessage);
    }
  }
};
