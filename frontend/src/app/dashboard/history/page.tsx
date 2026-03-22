"use client";

import { motion } from "framer-motion";
import { FileText, Clock, AlertTriangle, Download, ActivitySquare, Home, Loader2, Stethoscope, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { jsPDF } from "jspdf";
import { formatConfidence } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function formatLocalTime(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Load from localStorage (Steps 2, 4, 5)
                const localHistory = JSON.parse(localStorage.getItem("diagnosisHistory") || "[]");
                const localAppHistory = JSON.parse(localStorage.getItem("appointmentHistory") || "[]");
                
                // 2. Load from API (Secondary source/backup)
                const [histRes, appsRes, userRes] = await Promise.all([
                    api.get("/user-history").catch(() => ({ data: [] })),
                    api.get("/appointments").catch(() => ({ data: [] })),
                    api.get("/user-profile").catch(() => ({ data: null }))
                ]);
                
                const apiHistory = (histRes as any).data || [];
                const apiApprovedApps = ((appsRes as any).data || []).filter((a: any) => a.status === "completed");

                // Merge (Step 5)
                setHistory([...localHistory, ...apiHistory]);
                setAppointments([...localAppHistory, ...apiApprovedApps]);
                setUser((userRes as any).data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Step 2, 3, 4: Normalize and Merge into Single Array Sorted by Latest First
    const normalizedDiagnosis = history.map(item => ({
        ...item,
        type: "diagnosis",
        time: item.timestamp || item.date
    }));

    const normalizedAppointments = appointments.map(item => ({
        ...item,
        type: "appointment",
        time: item.completedAt || item.dateCreated || item.date
    }));

    const fullHistory = [
        ...normalizedDiagnosis,
        ...normalizedAppointments
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-12 h-12 text-[#2563eb] animate-spin" />
            </div>
        );
    }

    const downloadPdf = (item: any) => {
        try {
            const pdf = new jsPDF();
            const patientName = user?.name || "Patient";
            const reportDate = new Date(item.time || item.timestamp || item.date).toLocaleDateString();
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
        pdf.text(reportDate, 50, yPos);
        yPos += 7;
        
        pdf.setFont("helvetica", "normal");
        pdf.text(`Symptoms:`, 20, yPos);
        pdf.setFont("helvetica", "bold");
        const symptomText = (item.symptoms || []).join(", ");
        const splitSymptoms = pdf.splitTextToSize(symptomText, 140);
        pdf.text(splitSymptoms, 50, yPos);
        yPos += (splitSymptoms.length * 7) + 3;

        pdf.setDrawColor(230, 230, 230);
        pdf.line(20, yPos, 190, yPos);
        yPos += 10;

        // Section: AI Diagnosis Results
        if (item.predictions && item.predictions.length > 0) {
            pdf.setFontSize(14);
            pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            pdf.setFont("helvetica", "bold");
            pdf.text("AI Diagnosis Results", 20, yPos);
            yPos += 10;

            item.predictions.forEach((p: any) => {
                const prob = parseFloat(formatConfidence(p.probability));
                const diseaseDisplay = t(p.disease.toLowerCase().replace(/\s+/g, '_'));
                
                pdf.setFontSize(11);
                pdf.setTextColor(50, 50, 50);
                pdf.setFont("helvetica", "bold");
                pdf.text(diseaseDisplay, 25, yPos);
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
        }

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
        const riskStr = item.risk_level || "Unknown";
        const isHigh = riskStr.includes("High");
        pdf.setTextColor(isHigh ? 220 : 180, isHigh ? 20 : 150, 20);
        pdf.text(riskStr, 45, yPos);
        
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "normal");
        yPos += 6;
        pdf.text("This risk level is calculated based on symptom patterns detected by the AI diagnostic model.", 20, yPos);
        yPos += 12;

        // Section: Specialist
        if (item.recommendations?.specialty) {
            pdf.setFontSize(14);
            pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            pdf.setFont("helvetica", "bold");
            pdf.text("Recommended Specialist", 20, yPos);
            yPos += 8;

            pdf.setFontSize(11);
            pdf.setTextColor(50, 50, 50);
            pdf.setFont("helvetica", "bold");
            pdf.text(item.recommendations.specialty, 25, yPos);
            yPos += 6;
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 100, 100);
            pdf.text("Based on your symptoms, consulting this specialist is recommended for further evaluation.", 20, yPos);
            yPos += 12;
        }

        // Section: Precautions
        if (item.precautions && item.precautions.length > 0) {
            pdf.setFontSize(14);
            pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            pdf.setFont("helvetica", "bold");
            pdf.text("Recommended Care Instructions", 20, yPos);
            yPos += 8;

            pdf.setFontSize(11);
            pdf.setTextColor(50, 50, 50);
            pdf.setFont("helvetica", "normal");
            item.precautions.forEach((pre: string) => {
                pdf.text(`• ${pre}`, 25, yPos);
                yPos += 7;
            });
        }

        // Footer
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text("Generated by MediAI Healthcare System", 105, 280, { align: "center" });
        pdf.setFontSize(8);
        pdf.text("Disclaimer: This report is generated by an AI diagnostic system and should not replace professional medical consultation.", 105, 285, { align: "center" });
        
        const fileDate = new Date(item.time || item.timestamp || item.date).toISOString().split('T')[0];
        const fileName = `MediAI-History-Report-${fileDate}.pdf`;
        pdf.save(fileName);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 pb-32">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
                <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group" title="Back to Home">
                    <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{t("medical_history")}</h1>
                    <p className="text-gray-400">{t("timeline_description")}</p>
                </div>
            </motion.div>

            <div className="space-y-6">
                {fullHistory.length === 0 ? (
                    <div className="glass-panel p-12 text-center rounded-3xl">
                        <ActivitySquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">{t("no_history")}</p>
                        <Link href="/dashboard/symptoms" className="text-[#2563eb] font-bold mt-4 inline-block hover:underline">{t("start_symptom_check")}</Link>
                    </div>
                ) : fullHistory.map((item: any, i: number) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="flex gap-6 relative"
                    >
                        {/* Timeline Line */}
                        <div className="hidden md:flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full ${item.type === 'appointment' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-[#2563eb] shadow-[0_0_10px_rgba(37,99,235,0.8)]'} mt-2`} />
                            {i !== fullHistory.length - 1 && <div className="w-0.5 h-full bg-white/10 mt-2" />}
                        </div>

                        {item.type === 'diagnosis' ? (
                            <div className="glass-panel p-6 rounded-3xl flex-1 border border-white/5 hover:border-[#2563eb]/30 transition-all group relative overflow-hidden">
                                {item.risk_level === "High" && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] pointer-events-none" />
                                )}

                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatLocalTime(item.time)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${(item.risk_level || 'Low').includes('High') ? 'bg-red-500/20 text-red-500 border-red-500/30' : (item.risk_level || 'Low').includes('Medium') ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'}`}>
                                            {t(`${(item.risk_level || 'low').toLowerCase()}_risk`)}
                                        </span>
                                        {item.emergency && <span className="text-xs text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded-full animate-pulse">{t("emergency")}</span>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">{t("symptoms_reported")}</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {item.symptoms.map((s: string) => <span key={s} className="px-3 py-1 bg-white/5 rounded-full text-sm font-medium border border-white/5">{s}</span>)}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <ActivitySquare className="w-5 h-5 text-[#00d6ff]" />
                                            <div>
                                                <p className="text-sm text-gray-400">{t("ai_prediction")}</p>
                                                <p className="text-lg font-bold">{item.predictions[0]?.disease ? t(item.predictions[0]?.disease.toLowerCase().replace(/\s+/g, '_')) : t("none")} ({formatConfidence(item.predictions[0]?.probability)}%)</p>
                                            </div>
                                        </div>
                                        <button onClick={() => downloadPdf(item)} className="flex items-center justify-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all h-full">
                                            <FileText className="w-4 h-4" /> {t("view_full_report")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-panel p-6 rounded-3xl flex-1 border border-white/5 hover:border-green-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[40px] pointer-events-none" />
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <Clock className="w-4 h-4" />
                                            <span>{t("completed_appointment")}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 pl-6">{formatLocalTime(item.time)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-green-500/20 text-green-500 border-green-500/30 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> {t("visit_completed")}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 to-[#00d6ff] flex items-center justify-center font-bold text-2xl text-white shadow-lg shrink-0">
                                        {item.doctorName.charAt(0)}
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-xl font-bold">{item.doctorName}</h3>
                                        <p className="text-[#00d6ff] text-sm font-medium">{t((item.specialty || "General").toLowerCase().replace(/\s+/g, '_'))}</p>
                                        <p className="text-gray-400 text-xs mt-1">{item.hospital}</p>
                                    </div>
                                    <div className="sm:ml-auto text-center sm:text-right">
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{t("scheduled_time")}</p>
                                        <p className="text-sm font-bold text-white mt-1">{item.appointmentTime}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
