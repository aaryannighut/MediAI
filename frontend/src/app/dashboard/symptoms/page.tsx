"use client";

import { useState, useEffect } from "react";
import { Mic, Search, ActivitySquare, ShieldCheck, ArrowRight, Loader2, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

const COMMON_SYMPTOMS = [
    "Fever", "Cough", "Headache", "Stomach Pain", "Nausea",
    "Vomiting", "Chest Pain", "Shortness of Breath", "Rash",
    "Itching", "Joint Pain", "Chills", "Sweating"
];

export default function SymptomChecker() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/user-profile");
                setUser(res.data);
            } catch (err) { }
        };
        fetchUser();
    }, []);

    const toggleSymptom = (s: string) => {
        setSelected(prev => prev.includes(s) ? prev.filter(p => p !== s) : [...prev, s]);
    };

    const [voiceError, setVoiceError] = useState("");

    const SYMPTOM_KEYWORDS: Record<string, string[]> = {
        "Fever": ["fever", "high temperature", "temperature", "hot", "feverish", "burning up", "warm", "high temp"],
        "Cough": ["cough", "coughing", "dry cough", "wet cough", "hacking", "throat irritation"],
        "Headache": ["headache", "head pain", "migraine", "pounding head", "temple pain", "throbbing head"],
        "Stomach Pain": ["stomach pain", "stomach ache", "belly ache", "abdominal pain", "tummy ache", "stomach cramps", "gut pain"],
        "Nausea": ["nausea", "feeling sick", "queasy", "stomach upset", "sick to my stomach", "dizzy"],
        "Vomiting": ["vomiting", "vomit", "throwing up", "puke", "threw up", "sick"],
        "Chest Pain": ["chest pain", "heart pain", "tight chest", "chest pressure", "pain in my chest", "chest hurt"],
        "Shortness of Breath": ["shortness of breath", "breathless", "difficulty breathing", "hard to breathe", "gasping", "heavy breathing", "can't breathe"],
        "Rash": ["rash", "skin rash", "redness", "skin irritation", "bumps", "spots on skin"],
        "Itching": ["itching", "itchy", "scratchy", "need to scratch", "skin itches"],
        "Joint Pain": ["joint pain", "body ache", "bone pain", "knee pain", "elbow pain", "stiff joints", "muscle ache", "hurting all over"],
        "Chills": ["chills", "shivering", "feeling cold", "cold shakes", "freezing"],
        "Sweating": ["sweating", "sweat", "perspiring", "clammy", "drenched in sweat"]
    };

    const [liveTranscript, setLiveTranscript] = useState("");

    const handleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setVoiceError(t("speech_not_supported"));
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true; 
        recognition.continuous = true;    
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsRecording(true);
            setVoiceError("");
            setLiveTranscript("");
        };

        recognition.onresult = (event: any) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript.toLowerCase();
            }
            
            setLiveTranscript(currentTranscript);
            
            // Immediate real-time detection
            const detected: string[] = [];
            Object.entries(SYMPTOM_KEYWORDS).forEach(([symptom, keywords]) => {
                const isMatch = keywords.some(keyword => {
                    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                    return regex.test(currentTranscript) || currentTranscript.includes(keyword);
                });

                if (isMatch) {
                    detected.push(symptom);
                }
            });

            if (detected.length > 0) {
                setSelected(prev => {
                    const updated = [...new Set([...prev, ...detected])];
                    return updated;
                });
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech') {
                console.error("Speech Error:", event.error);
                setVoiceError(`${t("voice_error")} ${event.error}`);
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            if (isRecording) {
                recognition.start(); // Auto-restart for persistent high-frequency listening
            } else {
                setIsRecording(false);
                setLiveTranscript("");
            }
        };

        if (isRecording) {
            recognition.stop();
            setIsRecording(false);
        } else {
            recognition.start();
            // Automatically timeout after 12 seconds of active listening
            setTimeout(() => {
                recognition.stop();
                setIsRecording(false);
                setLiveTranscript("");
            }, 12000);
        }
    };

    const handleSubmit = async () => {
        if (selected.length === 0) return;
        setLoading(true);

        try {
            const res = await api.post("/predict-disease", {
                symptoms: selected,
                age: user?.age || 25,
                gender: user?.gender || "other",
                duration_days: 1
            });

            // Store results in sessionStorage for the results page
            sessionStorage.setItem("lastDiagnosis", JSON.stringify(res.data));

            // Save to persistent localStorage history
            const newDiagnosis = {
                disease: res.data.predictions[0]?.disease || "Unknown",
                confidence: res.data.predictions[0]?.probability || 0,
                risk_level: res.data.risk_level || "Low Risk",
                symptoms: selected,
                timestamp: new Date().toISOString(),
                predictions: res.data.predictions, // Keep for full report
                precautions: res.data.precautions,
                recommendations: res.data.recommendations,
                emergency: res.data.emergency
            };

            const history = JSON.parse(localStorage.getItem("diagnosisHistory") || "[]");
            history.unshift(newDiagnosis); // Add to beginning
            localStorage.setItem("diagnosisHistory", JSON.stringify(history));
            
            const query = new URLSearchParams({ s: selected.join(",") }).toString();
            router.push(`/dashboard/results?${query}`);
        } catch (err) {
            console.error("Analysis failed", err);
            // Even if it fails, go to results, it will handle missing data or retry
            const query = new URLSearchParams({ s: selected.join(",") }).toString();
            router.push(`/dashboard/results?${query}`);
        } finally {
            setLoading(false);
        }
    };

    const filtered = COMMON_SYMPTOMS.filter(s => s.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 pb-24 md:pb-10">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
                <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group" title="Back to Home">
                    <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{t("new_diagnosis")}</h1>
                    <p className="text-gray-400">{t("symptom_description")}</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-8 rounded-3xl space-y-8">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder={t("search_symptoms")}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 pl-12 focus:outline-none focus:border-[#2563eb] transition-colors"
                        />
                        <Search className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                    </div>

                    <button
                        onClick={handleVoiceInput}
                        className={`flex items-center justify-center shrink-0 w-14 h-14 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-[#00d6ff]/20 text-[#00d6ff] hover:bg-[#00d6ff]/30 border border-[#00d6ff]/50'}`}
                    >
                        <Mic className="w-6 h-6" />
                    </button>
                </div>

                {(isRecording || voiceError) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
                        <div className="text-sm text-red-500 font-bold h-5">
                            {isRecording ? t("listening_live") : voiceError}
                        </div>
                        {isRecording && liveTranscript && (
                            <div className="text-xs text-gray-400 italic bg-white/5 py-2 px-4 rounded-xl border border-white/5 inline-block">
                                "{liveTranscript}"
                            </div>
                        )}
                    </motion.div>
                )}

                <div>
                    <h3 className="font-semibold mb-4 text-gray-300">{t("common_symptoms")}</h3>
                    <div className="flex flex-wrap gap-3">
                        {filtered.map(symp => (
                            <button
                                key={symp}
                                onClick={() => toggleSymptom(symp)}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${selected.includes(symp)
                                    ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {t(symp.toLowerCase().replace(/\s+/g, '_'))}
                            </button>
                        ))}
                        {filtered.length === 0 && <p className="text-sm text-gray-500">{t("no_matches")}</p>}
                    </div>
                </div>

            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-end pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={selected.length === 0 || loading}
                    className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all text-lg ${selected.length > 0
                        ? 'bg-[#2563eb] text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:bg-blue-600 hover:shadow-[0_0_30px_rgba(37,99,235,0.8)]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{t("analyze_symptoms")} <ArrowRight className="w-5 h-5" /></>}
                </button>
            </motion.div>

        </div>
    );
}
