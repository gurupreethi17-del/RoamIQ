import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Repeat, Globe, CameraOff, MicOff, Sparkles } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useTripContext } from '../hooks/useTripData';

// Basic Levenshtein mapping for fuzzy transcription comparison
const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

const TranslatePage = () => {
    const [trip] = useTripContext();
    const [activeMode, setActiveMode] = useState<'voice' | 'visual'>('voice');

    // Language Configuration
    const [targetLang, setTargetLang] = useState('English');
    const [spokenLang, setSpokenLang] = useState('en-IN'); // Native accent default

    // Result States
    const [originalText, setOriginalText] = useState('');
    const [correctedText, setCorrectedText] = useState('');
    const [resultText, setResultText] = useState('');

    // Status Trackers
    const [detectedSourceLang, setDetectedSourceLang] = useState<string | null>(null);
    const [translationError, setTranslationError] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Context Loading
    const contextKeywords = trip?.destination?.attractions?.map(a => a.name) || [];
    if (trip?.destination?.name) contextKeywords.push(trip.destination.name);

    // Media References
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);

    const langCodeMap: Record<string, string> = {
        'English': 'en',
        'Hindi': 'hi',
        'Telugu': 'te',
        'Japanese': 'ja',
        'Spanish': 'es',
        'French': 'fr'
    };

    const spokenLangs = [
        { code: 'en-IN', label: 'English (India)' },
        { code: 'en-US', label: 'English (US)' },
        { code: 'en-GB', label: 'English (UK)' },
        { code: 'hi-IN', label: 'Hindi (Native)' },
        { code: 'te-IN', label: 'Telugu (Native)' },
        { code: 'ta-IN', label: 'Tamil (Native)' },
        { code: 'kn-IN', label: 'Kannada (Native)' },
        { code: 'ml-IN', label: 'Malayalam (Native)' },
        { code: 'bn-IN', label: 'Bengali (Native)' },
        { code: 'mr-IN', label: 'Marathi (Native)' }
    ];

    useEffect(() => {
        return () => stopCamera();
    }, []);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            alert("Camera access denied or unavailable.");
        }
    };

    const contextualizeTranscript = (transcript: string): string => {
        let corrected = transcript;
        const tLower = transcript.toLowerCase();

        for (const place of contextKeywords) {
            const pLower = place.toLowerCase();

            // Substring Match Pruning: if "Charminar validity" contains "Charminar"
            if (tLower.includes(pLower)) {
                const extraLength = tLower.length - pLower.length;
                const stops = ["where", "how", "take", "is", "the", "a", "can", "i"];
                const hasStops = stops.some(s => tLower.includes(s));

                // If it's just the keyword + a phonetic artifact (e.g. validity) and no conversational connectors
                if (extraLength > 0 && extraLength <= 12 && !hasStops) {
                    corrected = place;
                    break;
                }
            } else {
                // Fuzzy Match Correction: if "Golcanda fort" vs "Golconda Fort"
                const dist = levenshteinDistance(tLower, pLower);
                if (dist <= 3 && tLower.length >= 5) {
                    corrected = place;
                    break;
                }
            }
        }
        return corrected;
    };

    const executeTranslation = async (text: string, forceTargetLang?: string) => {
        if (!text.trim()) return;
        setIsTranslating(true);
        setTranslationError('');
        setResultText('');
        setDetectedSourceLang(null);

        const target = forceTargetLang || targetLang;

        try {
            const targetCode = langCodeMap[target] || 'en';
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Translation API failed");

            const data = await response.json();
            const translatedPart = data[0].map((item: any) => item[0]).join('');
            const detectedCode = data[2];

            if (!translatedPart) throw new Error("No translation returned");

            setDetectedSourceLang(detectedCode);

            if (translatedPart.trim().toLowerCase() === text.trim().toLowerCase() && detectedCode !== targetCode) {
                setTranslationError("Language detected, but unable to reliably translate this specific dialect or romanized script.");
                setResultText(translatedPart);
            } else {
                setResultText(translatedPart);
            }
        } catch (error) {
            console.error(error);
            setTranslationError("Translation service unavailable or failed to process text.");
        } finally {
            setIsTranslating(false);
        }
    };

    const captureAndTranslate = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsProcessingImage(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL('image/png');

            try {
                const result = await Tesseract.recognize(imgData, 'eng');
                const text = result.data.text.trim();
                setOriginalText(text);
                setCorrectedText('');
                await executeTranslation(text);
            } catch (err) {
                setTranslationError("Failed to extract legible text from the image.");
            }
        }
        setIsProcessingImage(false);
    };

    const toggleVoiceTranslation = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice recognition is not supported in your browser.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        setOriginalText('');
        setCorrectedText('');
        setResultText('');
        setTranslationError('');
        setIsListening(true);

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Use explicitly selected accent/language configuration
        recognition.lang = spokenLang;
        recognition.interimResults = false;

        recognition.onresult = async (event: any) => {
            setIsListening(false);
            const result = event.results[0][0];
            const text = result.transcript;
            const confidence = result.confidence;

            setOriginalText(text);

            if (confidence < 0.3) {
                setTranslationError("I couldn't confidently understand that. Please try again.");
                return;
            }

            // Context-Aware Pruning for Tourism Nodes
            const contextualText = contextualizeTranscript(text);

            if (contextualText !== text) {
                setCorrectedText(contextualText);
            }

            await executeTranslation(contextualText);
        };

        recognition.onerror = () => {
            setIsListening(false);
            setTranslationError("Speech recognition failed or timed out.");
        };

        recognition.start();
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-extrabold mb-4">RoamIQ Translate</h1>

            <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
                <button
                    onClick={() => { setActiveMode('visual'); stopCamera(); }}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors ${activeMode === 'visual' ? 'bg-iqoo-yellow text-black' : 'text-gray-300'}`}
                >
                    <Camera className="w-5 h-5" />
                    <span>Visual</span>
                </button>
                <button
                    onClick={() => { setActiveMode('voice'); stopCamera(); }}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors ${activeMode === 'voice' ? 'bg-iqoo-yellow text-black' : 'text-gray-300'}`}
                >
                    <Mic className="w-5 h-5" />
                    <span>Voice</span>
                </button>
            </div>

            <div className="flex flex-col space-y-4 bg-white/5 p-4 rounded-xl">
                {activeMode === 'voice' && (
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center space-x-2">
                            <Mic className="text-iqoo-yellow w-5 h-5" />
                            <span className="font-semibold text-gray-300">Spoken Locale</span>
                        </div>
                        <select
                            value={spokenLang}
                            onChange={(e) => setSpokenLang(e.target.value)}
                            className="bg-transparent text-white font-bold border-b border-white/20 focus:outline-none pb-1 text-sm md:text-base max-w-[150px] md:max-w-xs truncate"
                        >
                            {spokenLangs.map(l => (
                                <option key={l.code} value={l.code} className="bg-iqoo-black">{l.label}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                        <Globe className="text-iqoo-yellow w-5 h-5" />
                        <span className="font-semibold text-gray-300">Output Language</span>
                    </div>
                    <Repeat className="w-5 h-5 text-gray-400 opacity-50 block md:hidden" />
                    <select
                        value={targetLang}
                        onChange={(e) => {
                            setTargetLang(e.target.value);
                            const textToCompute = correctedText || originalText;
                            if (textToCompute) {
                                executeTranslation(textToCompute, e.target.value);
                            }
                        }}
                        className="bg-transparent text-white font-bold border-b-2 border-iqoo-yellow focus:outline-none pb-1"
                    >
                        {['English', 'Hindi', 'Telugu', 'Japanese', 'Spanish', 'French'].map(l => (
                            <option key={l} value={l} className="bg-iqoo-black">{l}</option>
                        ))}
                    </select>
                </div>
            </div>

            {activeMode === 'visual' && (
                <div className="space-y-4">
                    {stream ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-iqoo-yellow/50 h-80 bg-black flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                            <button
                                onClick={captureAndTranslate}
                                disabled={isProcessingImage}
                                className="absolute bottom-6 bg-iqoo-yellow text-black p-4 rounded-full shadow-[0_0_20px_rgba(255,200,0,0.5)] z-10"
                            >
                                {isProcessingImage ? <span className="animate-spin text-xl">⏳</span> : <Camera className="w-6 h-6" />}
                            </button>
                            <button onClick={stopCamera} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white">
                                <CameraOff className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={startCamera} className="w-full h-40 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:border-iqoo-yellow hover:text-iqoo-yellow transition-colors text-gray-400">
                            <Camera className="w-8 h-8" />
                            <span>Tap to activate camera</span>
                        </button>
                    )}
                </div>
            )}

            {activeMode === 'voice' && (
                <div className="flex flex-col items-center justify-center space-y-6 py-12">
                    <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider text-center px-6">
                        Engine uses active destination data to automatically correct misinterpreted tourism names.
                    </p>
                    <button
                        onClick={toggleVoiceTranslation}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening
                            ? 'bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                            : 'bg-iqoo-yellow text-black shadow-[0_0_20px_rgba(255,200,0,0.4)]'
                            }`}
                    >
                        {isListening ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10" />}
                    </button>
                    <p className="text-gray-400 font-medium">
                        {isListening ? "Listening... Speak now." : "Tap the microphone and speak"}
                    </p>
                </div>
            )}

            {(originalText || isTranslating || translationError) && (
                <div className="space-y-4 pt-6 mt-4 border-t border-white/10">
                    <div className="glass-panel p-4 rounded-xl relative">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm text-gray-400">Detected Text:</p>
                        </div>
                        <p className={`text-lg ${correctedText ? 'line-through text-gray-500' : 'text-white'}`}>{originalText}</p>
                    </div>

                    {correctedText && (
                        <div className="glass-panel p-4 rounded-xl relative border border-green-500/20 bg-green-500/5">
                            <p className="text-sm text-green-400 font-bold mb-1 flex items-center space-x-2">
                                <Sparkles className="w-4 h-4" /> <span>Interpreted:</span>
                            </p>
                            <p className="text-lg text-white">{correctedText}</p>
                        </div>
                    )}

                    <div className="glass-panel border-iqoo-yellow/30 p-4 rounded-xl relative">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm text-iqoo-yellow font-bold">Translated to {targetLang}:</p>
                            {detectedSourceLang && !isTranslating && (
                                <p className="text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">
                                    [Source: {detectedSourceLang}]
                                </p>
                            )}
                        </div>

                        {isTranslating ? (
                            <div className="flex items-center space-x-2 text-gray-400 animate-pulse">
                                <span className="font-medium">Translating sequence...</span>
                            </div>
                        ) : translationError ? (
                            <p className="text-red-400 text-sm font-medium">{translationError}</p>
                        ) : (
                            <p className="text-lg text-white font-medium whitespace-pre-line">{resultText}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranslatePage;
