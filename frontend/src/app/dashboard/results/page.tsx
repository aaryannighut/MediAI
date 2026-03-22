"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, Activity, Brain, Check, UserCheck, Stethoscope, Download } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import api from "@/lib/api";
import { formatConfidence } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Prediction {
    disease: string;
    probability: number;
}

interface ResultData {
    predictions: Prediction[];
    risk_level: string;
    precautions: string[];
    recommendations: { specialty: string; doctors: string[] };
    emergency: boolean;
}

function ResultsContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const symptomsQuery = searchParams.get("s") || "";
    const symptoms = symptomsQuery ? symptomsQuery.split(",") : [];

    const [data, setData] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                // Try reading from sessionStorage first (passed from symptoms page)
                const stored = sessionStorage.getItem("lastDiagnosis");
                if (stored) {
                    setData(JSON.parse(stored));
                } else if (symptoms.length > 0) {
                    // Fallback: Fetch directly if refreshed
                    const res = await api.post("/analyze", {
                        symptoms,
                        age: 25,
                        gender: "other",
                        duration_days: 1
                    });
                    setData(res.data);
                }
                
                // Fetch user for PDF name
                const userRes = await api.get("/user-profile");
                setUser(userRes.data);
            } catch (err) {
                console.error("Failed to load results", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [symptomsQuery]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-20 h-20 rounded-full border-b-2 border-t-2 border-[#00d6ff] flex items-center justify-center relative">
                    <Brain className="w-8 h-8 text-[#00d6ff]" />
                </motion.div>
                <p className="text-xl font-medium animate-pulse text-[#00d6ff]">{t("analyzing_symptoms")}</p>
            </div>
        );
    }

    if (!data) return (
        <div className="p-10 text-center space-y-4">
            <h1 className="text-2xl font-bold italic text-gray-400">{t("no_data_found")}</h1>
            <Link href="/dashboard/symptoms" className="text-[#2563eb] hover:underline font-bold">{t("try_again")}</Link>
        </div>
    );

    const downloadPdf = () => {
        const pdf = new jsPDF();
        const patientName = user?.name || "Patient";
        const date = new Date().toLocaleDateString();
        const accentColor = [37, 99, 235]; // #2563eb
        
        // Header
        pdf.setFontSize(22);
        pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text("MediAI Healthcare Diagnosis Report", 105, 20, { align: "center" });
        
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "normal");
        pdf.text("AI Powered Medical Assessment", 105, 26, { align: "center" });
        
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, 30, 190, 30);
        
        let yPos = 40;

        // Section: Patient Information
        pdf.setFontSize(14);
        pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text("Patient Information", 20, yPos);
        yPos += 8;
        
        pdf.setFontSize(11);
        pdf.setTextColor(50, 50, 50);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Patient Name:`, 20, yPos);
        pdf.setFont("helvetica", "bold");
        pdf.text(patientName, 50, yPos);
        yPos += 7;
        
        pdf.setFont("helvetica", "normal");
        pdf.text(`Report Date:`, 20, yPos);
        pdf.setFont("helvetica", "bold");
        pdf.text(date, 50, yPos);
        yPos += 7;
        
        pdf.setFont("helvetica", "normal");
        pdf.text(`Symptoms:`, 20, yPos);
        pdf.setFont("helvetica", "bold");
        const symptomText = symptoms.join(", ");
        const splitSymptoms = pdf.splitTextToSize(symptomText, 140);
        pdf.text(splitSymptoms, 50, yPos);
        yPos += (splitSymptoms.length * 7) + 3;

        pdf.setDrawColor(230, 230, 230);
        pdf.line(20, yPos, 190, yPos);
        yPos += 10;

        // Section: AI Diagnosis Results
        pdf.setFontSize(14);
        pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text("AI Diagnosis Results", 20, yPos);
        yPos += 10;

        data.predictions.forEach((p) => {
            const prob = parseFloat(formatConfidence(p.probability));
            pdf.setFontSize(11);
            pdf.setTextColor(50, 50, 50);
            pdf.setFont("helvetica", "bold");
            pdf.text(p.disease, 25, yPos);
            pdf.text(`${prob}%`, 185, yPos, { align: "right" });
            yPos += 4;
            
            // Progress bar
            pdf.setDrawColor(240, 240, 240);
            pdf.setFillColor(245, 245, 245);
            pdf.rect(25, yPos, 160, 3, 'F');
            pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
            pdf.rect(25, yPos, (prob / 100) * 160, 3, 'F');
            yPos += 10;
        });

        yPos += 2;
        pdf.setDrawColor(230, 230, 230);
        pdf.line(20, yPos, 190, yPos);
        yPos += 10;

        // Section: Risk Assessment
        pdf.setFontSize(14);
        pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text("Risk Assessment", 20, yPos);
        yPos += 8;

        pdf.setFontSize(11);
        pdf.setTextColor(50, 50, 50);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Risk Level:`, 20, yPos);
        pdf.setFont("helvetica", "bold");
        const isHigh = data.risk_level.includes("High");
        pdf.setTextColor(isHigh ? 220 : 180, isHigh ? 20 : 150, 20);
        pdf.text(data.risk_level, 45, yPos);
        
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "normal");
        yPos += 6;
        pdf.text("This risk level is calculated based on symptom patterns detected by the AI diagnostic model.", 20, yPos);
        yPos += 12;

        // Section: Specialist
        pdf.setFontSize(14);
        pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text("Recommended Specialist", 20, yPos);
        yPos += 8;

        pdf.setFontSize(11);
        pdf.setTextColor(50, 50, 50);
        pdf.setFont("helvetica", "bold");
        pdf.text(data.recommendations.specialty, 25, yPos);
        yPos += 6;
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text("Based on your symptoms, consulting this specialist is recommended for further evaluation.", 20, yPos);
        yPos += 12;

        // Section: Precautions
        pdf.setFontSize(14);
        pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text("Recommended Care Instructions", 20, yPos);
        yPos += 8;

        pdf.setFontSize(11);
        pdf.setTextColor(50, 50, 50);
        pdf.setFont("helvetica", "normal");
        data.precautions.forEach((pre) => {
            pdf.text(`• ${pre}`, 25, yPos);
            yPos += 7;
        });

        // Footer
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text("Generated by MediAI Healthcare System", 105, 280, { align: "center" });
        pdf.setFontSize(8);
        pdf.text("Disclaimer: This report is generated by an AI diagnostic system and should not replace professional medical consultation.", 105, 285, { align: "center" });
        
        const fileName = `MediAI-Report-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 pb-32">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("ai_diagnosis_results")}</h1>
                    <p className="text-gray-400 mt-2">{t("based_on_symptoms")}: <span className="text-white font-medium">{symptoms.join(", ")}</span></p>
                </div>
                <button onClick={downloadPdf} className="flex items-center gap-2 bg-[#2563eb] hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                    <Download className="w-4 h-4" /> {t("download_pdf")}
                </button>
            </div>

            <div id="report-content" className="space-y-8 bg-[#050505] p-2 rounded-2xl">

                {data.emergency && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-red-500/10 border border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)] flex gap-4 items-start">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse text-white mt-1">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-red-500 mb-2">{t("critical_warning")}</h2>
                            <p className="text-red-300 font-medium">{t("emergency_desc")}</p>
                        </div>
                    </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Predictions & Risk */}
                    <div className="space-y-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-8 rounded-3xl space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <Activity className="w-6 h-6 text-[#2563eb]" />
                                <h2 className="text-xl font-bold">{t("predicted_diseases")}</h2>
                            </div>

                            <div className="space-y-6">
                                {data.predictions.map((p, i) => (
                                    <div key={p.disease}>
                                        <div className="flex justify-between font-medium mb-2">
                                            <span className="text-lg">{t(p.disease.toLowerCase().replace(/\s+/g, '_'))}</span>
                                            <span className={i === 0 ? "text-[#00d6ff] font-bold text-xl" : "text-gray-400"}>{formatConfidence(p.probability)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${formatConfidence(p.probability)}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-[#2563eb] to-[#00d6ff] shadow-[0_0_15px_rgba(0,214,255,0.5)]' : 'bg-gray-600'}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-8 rounded-3xl">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                                <ShieldCheck className={`w-6 h-6 ${data.risk_level.includes('High') ? 'text-red-500' : 'text-yellow-500'}`} />
                                <h2 className="text-xl font-bold">{t("risk_assessment")}</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-2 rounded-lg font-bold ${(data.risk_level || 'Low').includes('High') ? 'bg-red-500/20 text-red-500 border border-red-500/50' : (data.risk_level || 'Low').includes('Medium') ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-green-500/20 text-green-500 border border-green-500/50'}`}>
                                    {t((data.risk_level || 'low').toLowerCase().replace(/\s+/g, '_'))}
                                </span>
                                <p className="text-sm text-gray-400">{t("system_confidence_high")}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Precautions & Doctors */}
                    <div className="space-y-8">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-8 rounded-3xl space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <Stethoscope className="w-6 h-6 text-[#00d6ff]" />
                                <h2 className="text-xl font-bold">{t("precautions")}</h2>
                            </div>
                            <ul className="space-y-4">
                                {data.precautions.map((p, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <div className="bg-[#2563eb]/20 p-1 rounded-full mt-1 shrink-0 text-[#2563eb]">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <p className="text-gray-300 font-medium">{p}</p>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-8 rounded-3xl space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 justify-between">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="w-6 h-6 text-green-500" />
                                    <h2 className="text-xl font-bold">{t("recommendations")}</h2>
                                </div>
                                <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-400 tracking-wider uppercase font-bold">
                                    {t(data.recommendations.specialty.toLowerCase().replace(/\s+/g, '_'))}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {data.recommendations.doctors.map((doc, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                                {doc.charAt(0)}
                                            </div>
                                            <span className="font-bold text-lg">{doc}</span>
                                        </div>
                                        <Link href={`/dashboard/doctors?q=${doc}`} className="text-[#00d6ff] text-sm font-bold hover:underline">
                                            {t("book")}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading results...</div>}>
            <ResultsContent />
        </Suspense>
    )
}
