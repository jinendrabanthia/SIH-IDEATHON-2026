import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { nluApi } from '../../api/services/nluApi';
import { NLUExtractResult } from '../../types/domain';

interface VoicePromptInputProps {
  onExtract: (result: NLUExtractResult, originalPrompt: string) => void;
  className?: string;
}

export const VoicePromptInput: React.FC<VoicePromptInputProps> = ({ onExtract, className }) => {
  const { t, i18n } = useTranslation();
  const [promptText, setPromptText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Web Speech API Voice Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. Please type your prompt.');
      return;
    }

    const recognition = new SpeechRecognition();
    const langCode = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'or' ? 'or-IN' : 'en-IN';
    recognition.lang = langCode;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMsg(null);
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setPromptText(speechResult);
      handleProcessPrompt(speechResult);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleProcessPrompt = async (textToProcess?: string) => {
    const text = textToProcess || promptText;
    if (!text.trim() || text.length < 3) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const extracted = await nluApi.extractPreferences(text);
      onExtract(extracted, text);
    } catch (err: any) {
      console.error('Failed to extract preferences:', err);
      setErrorMsg('Could not parse voice prompt. Please try adjusting your wording.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="relative flex items-center shadow-lg rounded-2xl bg-white border border-slate-200/90 focus-within:ring-2 focus-within:ring-orange-500/50 p-1.5 transition-all">
        <div className="pl-3 text-orange-600">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>

        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleProcessPrompt()}
          placeholder={t('hero.promptPlaceholder')}
          className="w-full px-3 py-3 text-sm sm:text-base text-slate-800 bg-transparent placeholder:text-slate-400 focus:outline-none"
        />

        <div className="flex items-center gap-1.5 pr-1">
          {/* Voice Speech Mic Button */}
          <button
            type="button"
            onClick={startSpeechRecognition}
            title={t('hero.voicePrompt')}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-ping'
                : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Submit Action */}
          <Button
            size="sm"
            onClick={() => handleProcessPrompt()}
            disabled={isProcessing || !promptText.trim()}
            className="h-10 px-4 rounded-xl font-semibold gap-1.5"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">{t('hero.startPlanning')}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-rose-600 pl-3">{errorMsg}</p>
      )}
    </div>
  );
};
