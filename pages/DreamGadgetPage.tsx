import React, { useState } from 'react';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { generateDreamGadgetImage } from '../services/geminiService';
import { toast } from 'react-toastify';

const INVENTION_SUCCESS_MESSAGE = "Behold! Your amazing invention, brought to life!";

export const DreamGadgetPage: React.FC = () => {
  const [promptText, setPromptText] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inventionMessage, setInventionMessage] = useState<string | null>(null);

  const handleInventAnother = () => {
    setPromptText('');
    setGeneratedImageUrl(null);
    setInventionMessage(null);
    setIsLoading(false);
  };

  const handleSubmitInvention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) {
      toast.warn("Please describe your dream gadget first.");
      return;
    }

    setIsLoading(true);
    setGeneratedImageUrl(null);
    setInventionMessage(null);

    try {
      // More generic prompt for image generation
      const professionalPrompt = `A concept image of a futuristic gadget: ${promptText}. The style should be clean, modern, and visually appealing.`;
      const imageUrl = await generateDreamGadgetImage(professionalPrompt);
      setGeneratedImageUrl(imageUrl);
      setInventionMessage(INVENTION_SUCCESS_MESSAGE);
      toast.success("Your dream gadget has been visualized!");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Invention error: ${err.message}. Please try a different idea.`);
      } else {
        toast.error("An unknown error occurred during image generation.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fadeIn">
      <header className="text-center py-10 bg-gradient-to-tr from-gumball-green via-gumball-yellow to-gumball-purple rounded-xl shadow-2xl mb-12">
        <h1 className="text-5xl md:text-6xl font-display text-white drop-shadow-lg">
          Dream Gadget Inventor
        </h1>
        <p className="text-xl font-techno text-gumball-dark dark:text-gumball-dark-deep mt-4">
          Describe your gadget idea, and our AI will visualize it for you!
        </p>
      </header>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gumball-dark-card p-6 sm:p-8 rounded-xl shadow-xl">
        {!generatedImageUrl && !isLoading && (
            <form onSubmit={handleSubmitInvention} className="space-y-6">
            <div>
                <label htmlFor="gadgetPrompt" className="block text-lg font-techno text-gumball-blue dark:text-gumball-blue/90 mb-2">
                Describe Your Gadget Invention:
                </label>
                <textarea
                id="gadgetPrompt"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g., A self-folding laundry machine with voice control..."
                rows={4}
                className="w-full p-3 border-2 border-gumball-purple dark:border-gumball-purple/70 rounded-lg shadow-sm focus:ring-gumball-pink focus:border-gumball-pink text-md font-body dark:bg-gumball-dark dark:text-gumball-light-bg dark:placeholder-gray-400"
                aria-label="Gadget description prompt"
                />
            </div>
            <Button type="submit" variant="secondary" size="lg" className="w-full font-display text-xl" disabled={isLoading}>
                Invent
            </Button>
            </form>
        )}

        {isLoading && (
          <div className="text-center py-10">
            <LoadingSpinner message="Visualizing your invention... Please wait." size="lg" color="text-gumball-pink" />
            <p className="font-techno text-gumball-purple dark:text-gumball-purple/80 mt-3">This may take a moment.</p>
          </div>
        )}

        {generatedImageUrl && !isLoading && (
          <div className="text-center py-6 animate-fadeIn">
            <h2 className="text-3xl font-display text-gumball-green mb-4">{inventionMessage}</h2>
            <div className="border-4 border-dashed border-gumball-pink dark:border-gumball-pink/70 p-2 rounded-lg inline-block shadow-lg bg-gumball-yellow/20 dark:bg-gumball-yellow/10">
                <img 
                    src={generatedImageUrl} 
                    alt="Generated Dream Gadget" 
                    className="max-w-full h-auto md:max-h-[500px] rounded-md shadow-md mx-auto"
                />
            </div>
            <p className="font-techno text-gumball-dark dark:text-gumball-light-bg/80 mt-6 mb-6">A glimpse of future technology!</p>
            <Button onClick={handleInventAnother} variant="primary" size="lg">
              Invent Another Gadget
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};