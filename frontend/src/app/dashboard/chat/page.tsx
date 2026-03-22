"use client";

import { useState, useEffect } from "react";
import { Send, Activity, User, Info, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function ChatbotPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/user-profile");
                setUser(res.data);
                setMessages([
                    { role: "assistant", content: `${t("chat_welcome").replace("Hello,", `Hello ${res.data.name || "User"},`)}` }
                ]);
            } catch (err) {
                setMessages([
                    { role: "assistant", content: t("chat_welcome") }
                ]);
            }
        };
        fetchUser();
    }, []);

    const SYMPTOM_KEYWORDS: Record<string, string[]> = {
        fever: ["fever", "high temperature"],
        headache: ["headache", "head pain"],
        cough: ["cough", "dry cough"],
        cold: ["cold", "runny nose"],
        fatigue: ["fatigue", "tired"],
        vomiting: ["vomiting", "nausea"],
        stomach_pain: ["stomach pain", "abdominal pain"],
        sore_throat: ["sore throat", "throat pain"],
        chest_pain: ["chest pain"],
        shortness_breath: ["breathing problem", "shortness of breath"]
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const response = await api.post("/chat", { text: userMsg });
            setMessages(prev => [...prev, { role: "assistant", content: response.data.response }]);
        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { role: "assistant", content: t("chat_error") }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[90vh] md:h-[calc(100vh-2rem)] p-4 md:p-6 pb-24 md:pb-6">

            <div className="glass-panel rounded-t-3xl border-b-0 border border-white/10 p-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group mr-1" title="Back to Home">
                        <Home className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    </Link>
                    <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold">{t("ai_assistant")}</h2>
                        <span className="text-xs text-[#00d6ff] font-medium flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#00d6ff] animate-pulse" /> {t("online")}
                        </span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white p-2">
                    <Info className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 glass-panel border-y-0 border border-white/10 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                        {msg.role === 'assistant' ? (
                            <div className="w-8 h-8 rounded-full bg-[#2563eb] shrink-0 flex items-center justify-center mt-2 shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0 flex items-center justify-center mt-2">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}

                        <div className={`p-4 max-w-[85%] rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-white/10 rounded-tr-none border border-white/5'
                            : 'bg-[#2563eb]/20 text-blue-50 border border-[#2563eb]/30 rounded-tl-none shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                            }`}>
                            {msg.content}
                        </div>

                    </motion.div>
                ))}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#2563eb] shrink-0 flex items-center justify-center mt-2">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div className="p-4 rounded-2xl bg-[#2563eb]/20 rounded-tl-none border border-[#2563eb]/30 space-x-1 flex items-center h-10">
                            <div className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 rounded-full bg-[#2563eb] animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="glass-panel p-4 rounded-b-3xl border border-white/10 border-t-0 shrink-0">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder={t("type_message")}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 pr-16 focus:outline-none focus:border-[#2563eb] transition-all"
                    />
                    <button onClick={sendMessage} className="absolute right-2 p-3 bg-[#2563eb] text-white rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]">
                        <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
                    </button>
                </div>
            </div>

        </div>
    );
}
