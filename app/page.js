"use client";
import { useState, useCallback } from "react";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [outputText, setOutputText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [summary, setSummary] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("es"); // Default target language: Spanish
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle user input and send text
  const handleSend = async () => {
    if (!userInput.trim()) {
      setError("Please enter some text.");
      return;
    }

    setIsLoading(true);
    setError("");
    setOutputText(userInput);
    setSummary("");
    setTranslatedText("");

    try {
      // Step 1: Detect the language of the input text
      const languageDetector = await self.ai.languageDetector.create();
      const detectedLanguageArr = await languageDetector.detect(userInput);
      const sourceLanguage = detectedLanguageArr[0].detectedLanguage;
      setDetectedLang(sourceLanguage);

      console.log("Detected Language:", sourceLanguage);
    } catch (error) {
      console.error("Error detecting language:", error);
      setError("Failed to detect language.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle summarization
  const handleSummarize = async () => {
    if (!outputText || detectedLang !== "en" || outputText.length <= 150)
      return;

    setIsLoading(true);
    setError("");

    try {
      const summarizerCapabilities = await self.ai.summarizer.capabilities();
      if (summarizerCapabilities.available === "no") {
        setError("Summarizer API is not available.");
        return;
      }

      const summarizer = await self.ai.summarizer.create({
        type: "key-points",
        format: "markdown",
        length: "medium",
      });

      const summary = await summarizer.summarize(outputText);
      setSummary(summary);
      console.log("Summary:", summary);
    } catch (error) {
      console.error("Error summarizing text:", error);
      setError("Failed to summarize text.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle translation
  const handleTranslate = async () => {
    if (!outputText || !targetLang) return;

    setIsLoading(true);
    setError("");

    try {
      const translatorCapabilities = await self.ai.translator.capabilities();
      const isSupported = translatorCapabilities.languagePairAvailable(
        detectedLang,
        targetLang
      );

      if (isSupported === "no") {
        setError("Language pair not supported for translation.");
        return;
      }

      const translator = await self.ai.translator.create({
        sourceLanguage: detectedLang,
        targetLanguage: targetLang,
      });

      const translatedText = await translator.translate(outputText);
      setTranslatedText(translatedText);
      console.log("Translated Text:", translatedText);
    } catch (error) {
      console.error("Error translating text:", error);
      setError("Failed to translate text.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" flex justify-center bg-gray-100 p-4">
      <div className="flex flex-col w-full md:max-w-4xl h-screen">
        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg shadow mb-4">
          {outputText && (
            <div className="mb-4">
              <p className="text-gray-800">{outputText}</p>
              <p className="text-sm text-gray-500 mt-2">
                Detected Language: {detectedLang}
              </p>
            </div>
          )}

          {summary && (
            <div className="mb-4">
              <p className="text-gray-800 font-semibold">Summary:</p>
              <p className="text-gray-600">{summary}</p>
            </div>
          )}

          {translatedText && (
            <div className="mb-4">
              <p className="text-gray-800 font-semibold">Translated Text:</p>
              <p className="text-gray-600">{translatedText}</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Input Area */}
        <div className="flex flex-col gap-2">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full p-2 border border-gray-300 rounded-lg resize-none"
            rows={3}
            aria-label="Text input"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            aria-label="Send"
          >
            {isLoading ? "Sending..." : "➤"}
          </button>
        </div>

        {/* Action Buttons */}
        {outputText && (
          <div className="flex flex-col gap-2 mt-4">
            {detectedLang === "en" && outputText.length > 150 && (
              <button
                onClick={handleSummarize}
                disabled={isLoading}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                aria-label="Summarize"
              >
                Summarize
              </button>
            )}

            <div className="flex gap-2">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg flex-1"
                aria-label="Select target language"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="pt">Portuguese</option>
                <option value="fr">French</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
              </select>
              <button
                onClick={handleTranslate}
                disabled={isLoading}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400"
                aria-label="Translate"
              >
                Translate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
