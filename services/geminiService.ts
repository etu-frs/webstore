import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure API_KEY is handled as per prompt. For local dev, you might use a .env file,
// but for the purpose of this exercise, we rely on process.env.API_KEY being set.
const API_KEY = process.env.API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn(
    "Gemini API Key not found. AI features will be limited or unavailable. Ensure process.env.API_KEY is set."
  );
}

const TEXT_MODEL_NAME = "gemini-1.5-flash";

export const generateProductDescription = async (
  productName: string,
  keywords: string[]
): Promise<string> => {
  if (!genAI) {
    return "AI service is not initialized. Please check API Key configuration.";
  }
  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL_NAME });
    
    const prompt = `Generate a concise and informative product description for a product named "${productName}". 
    The description should be 2-3 sentences and highlight its key features or benefits. 
    Incorporate these keywords if relevant: ${keywords.join(", ")}.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Error generating product description with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Failed to generate AI description for ${productName}. Error: ${errorMessage}`;
  }
};

export const searchRecentEvents = async (query: string): Promise<{ text: string; sources?: any[] }> => {
  if (!genAI) {
    return { text: "AI service is not initialized for search.", sources: [] };
  }
  try {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL_NAME });
    
    const result = await model.generateContent(query);
    const response = await result.response;
    
    return { text: response.text(), sources: [] };

  } catch (error) {
    console.error("Error searching with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { text: `Failed to search: ${errorMessage}`, sources: [] };
  }
};

export const generateDreamGadgetImage = async (
  prompt: string,
  retries = 2, // Max 2 retries (total 3 attempts)
  delay = 1000  // Initial delay in ms
): Promise<string> => {
  if (!genAI) {
    throw new Error("AI service is not initialized for image generation.");
  }

  try {
    // Note: Image generation is not available in the standard @google/generative-ai package
    // This would require a different service or API
    throw new Error("Image generation is not available with the current Google Generative AI package. Consider using a different image generation service.");
  } catch (error) {
    const attemptNumber = 3 - retries;
    console.error(`Error generating image (attempt ${attemptNumber}/3):`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (retries > 0) {
      console.log(`Retrying image generation in ${delay / 1000}s... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateDreamGadgetImage(prompt, retries - 1, delay * 2);
    } else {
      const finalErrorMessage = `Failed to generate dream gadget image after ${attemptNumber} attempt(s). Last error: ${errorMessage}`;
      console.error(finalErrorMessage, error);
      throw new Error(finalErrorMessage);
    }
  }
};
