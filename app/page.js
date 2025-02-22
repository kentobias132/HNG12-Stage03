"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [outputText, setOutputText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [summary, setSummary] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("es");
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
      // Detect the language of the input text
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
    <div className=" p-4">
      <div className="flex w-full justify-center mb-56">
        {/* Output Area */}
        <div className="flex-1 overflow-y-hidden p-4 mb-4 max-w-4xl">
          {/* User Input */}
          {outputText && (
            <div className="flex justify-end mb-6">
              <div className="bg-blue-100 p-3 rounded-lg w-[90%] md:max-w-[70%]">
                <p className="text-gray-900">{outputText}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Detected Language: {detectedLang}
                </p>
              </div>
            </div>
          )}

          {/* Summarized Output */}
          {summary && (
            <div className="flex justify-start mb-6">
              <div className="bg-green-100 p-3 rounded-lg w-[90%] md:max-w-[70%]">
                <p className="text-gray-800 font-semibold">Summary:</p>
                <p className="text-gray-600">{summary}</p>
              </div>
            </div>
          )}

          {/* Translated Output */}
          {translatedText && (
            <div className="flex justify-start mb-4">
              <div className="bg-purple-100 p-3 rounded-lg w-[90%] md:max-w-[70%]">
                <p className="text-gray-800 font-semibold">Translated Text:</p>
                <p className="text-gray-600">{translatedText}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex justify-center mb-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed h-20 bg-gray-50 bottom-0 right-0 left-0">
          <div className=" absolute bottom-10 right-5 left-5 lg:left-52 lg:right-52 flex flex-col gap-2 p-2 border bg-gray-200 border-gray-300 rounded-xl shadow-lg">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full bg-transparent p-2 border border-none outline-none resize-none"
              rows={3}
              aria-label="Text input"
            />

            <div className="flex items-center justify-between md:px-4">
              {/* Action Buttons */}
              {outputText && (
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-[80%] lg:w-[90%]">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 py-2">
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
                        {isLoading ? "Translating..." : "Translate"}
                      </button>
                    </div>
                  </div>

                  <div>
                    {detectedLang === "en" && outputText.length > 150 && (
                      <button
                        onClick={handleSummarize}
                        disabled={isLoading}
                        className="p-2 w-full bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                        aria-label="Summarize"
                      >
                        Summarize
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-5 bottom-4 bg-black text-white rounded-full hover:bg-gray-800 disabled:bg-gray-400"
                  aria-label="Send"
                >
                  {isLoading ? (
                    <Image
                      src={"/loading.gif"}
                      width={40}
                      height={40}
                      alt="loading"
                    />
                  ) : (
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon-2xl"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
