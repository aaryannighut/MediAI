"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, HeartPulse, Activity, AlertTriangle, UserCheck, Search, Clock, Home, Loader2, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatConfidence } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function DashboardHome() {
    const [user, setUser] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, historyRes, appsRes] = await Promise.all([
                    api.get("/user-profile"),
                    api.get("/user-history"),
                    api.get("/appointments")
                ]);
                setUser(userRes.data);
                setHistory(historyRes.data);
                
                // Merge backend data with localStorage
                const backendApps = appsRes.data.filter((a: any) => a.status === "booked");
                const localApps = JSON.parse(localStorage.getItem("appointments") || "[]");
                
                // Priority: Backend data. Filter local apps that might not be in backend yet.
                // We'll update the appointments state with backend data mainly.
                setAppointments(backendApps);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                
                // Fallback to localStorage if backend fails
                const localApps = JSON.parse(localStorage.getItem("appointments") || "[]");
                setAppointments(localApps.filter((a: any) => a.status === "booked" || a.status === "upcoming"));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-12 h-12 text-[#2563eb] animate-spin" />
            </div>
        );
    }

    const latestCheck = history.length > 0 ? history[0] : null;

    const handleUpdateStatus = async (doctorName: string, newStatus: string) => {
        try {
            await api.patch(`/appointments/${doctorName}`, { status: newStatus });
            
            // Update localStorage (Step 1, 2, 3)
            const localApps = JSON.parse(localStorage.getItem("appointments") || "[]");
            const appointmentIndex = localApps.findIndex((a: any) => a.doctorName === doctorName);
            
            // Note: appointments in localStorage might use status "upcoming" OR "booked"
            if (appointmentIndex !== -1) {
                const appToUpdate = localApps[appointmentIndex];
                
                if (newStatus === 'completed') {
                    // Move to history
                    const history = JSON.parse(localStorage.getItem("appointmentHistory") || "[]");
                    history.push({
                        ...appToUpdate,
                        status: "completed",
                        completedAt: new Date().toISOString()
                    });
                    localStorage.setItem("appointmentHistory", JSON.stringify(history));
                    
                    // Remove from upcoming
                    localApps.splice(appointmentIndex, 1);
                } else {
                    // Update status for others (e.g. cancelled)
                    localApps[appointmentIndex].status = newStatus;
                }
                localStorage.setItem("appointments", JSON.stringify(localApps));
            }
            
            setAppointments(prev => prev.filter(a => a.doctorName !== doctorName));
            setToast({ message: newStatus === 'cancelled' ? t('appointment_cancelled') : t('visit_marked_completed'), type: 'success' });
        } catch (err) {
            setToast({ message: t('update_failed'), type: 'error' });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };

    return (
        <div className="p-6 pb-24 md:pb-6 space-y-6 container mx-auto">
            <header className="flex justify-between items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group" title="Back to Home">
                        <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
                        <p className="text-gray-400 text-sm md:text-base">{t("welcome_back")}, {user?.name || 'User'}. {t("health_summary")}</p>
                    </div>
                </div>
                <div className="relative hidden md:block w-72">
                    <input type="text" placeholder={t("search_insights")} className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 focus:outline-none focus:border-[#2563eb]" />
                    <Search className="w-4 h-4 absolute left-4 top-3 text-gray-500" />
                </div>
            </header>

            <div className="grid lg:grid-cols-4 gap-6">

                {/* Left Column (Main Stats + Symptoms) */}
                <div className="lg:col-span-3 space-y-6">

                    <div className="grid md:grid-cols-3 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/20 blur-[30px]" />
                            <div className="flex items-center gap-3">
                                <HeartPulse className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-gray-300 text-sm">{t("health_score")}</span>
                            </div>
                            <div className="mt-4 flex items-end gap-2">
                                <span className="text-4xl font-bold">85</span>
                                <span className="text-sm text-green-500 font-medium mb-1">{t("good")}</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full mt-4">
                                <div className="bg-green-500 h-2 rounded-full w-[85%] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center gap-3 border-l-4 border-yellow-500 pl-3">
                                <span className="font-medium text-gray-300 text-sm">{t("risk_level")}</span>
                                <AlertTriangle className="w-4 h-4 text-yellow-500 ml-auto" />
                            </div>
                            <div className="mt-6 flex items-end gap-2">
                                <span className={`text-2xl font-bold ${latestCheck?.risk_level === 'High' ? 'text-red-500' : 'text-yellow-500'}`}>
                                    {latestCheck?.risk_level ? t(latestCheck.risk_level.toLowerCase().replace(" ", "_")) : t("no_appointments").replace(".", "")}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {latestCheck ? `${t("based_on_last_check")} (${new Date(latestCheck.date).toLocaleDateString()})` : t("symptom_description")}
                            </p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-[#00d6ff]" />
                                <span className="font-medium text-gray-300 text-sm">{t("predicted_disease")}</span>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-white truncate mr-2">{latestCheck?.predictions[0]?.disease || t("none")}</span>
                                    <span className="text-xs text-[#00d6ff]">{formatConfidence(latestCheck?.predictions[0]?.probability || 0)}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full">
                                    <div
                                        className="bg-[#00d6ff] h-1.5 rounded-full shadow-[0_0_10px_rgba(0,214,255,0.5)]"
                                        style={{ width: `${formatConfidence(latestCheck?.predictions[0]?.probability || 0)}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-3xl h-80 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{t("recent_symptoms")}</h2>
                                <Clock className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="space-y-4">
                                {latestCheck?.symptoms?.map((symp: string, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-gray-600 transition-colors">
                                        <span className="text-sm font-medium">{t(symp.toLowerCase().replace(/\s+/g, '_'))}</span>
                                        <span className="text-xs text-gray-500">{t("latest")}</span>
                                    </div>
                                )) || <p className="text-gray-500 text-sm">{t("no_history")}</p>}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-3xl h-80">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{t("recommended_doctors")}</h2>
                                <UserCheck className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="space-y-4">
                                {latestCheck?.recommendations?.doctors?.slice(0, 2).map((doc: string, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#2563eb]" />
                                        <div className="w-10 h-10 rounded-full bg-gray-700 font-bold flex items-center justify-center text-xs">{doc.charAt(0)}</div>
                                        <div>
                                            <p className="text-sm font-bold">{doc}</p>
                                            <p className="text-xs text-gray-400">{t(latestCheck?.recommendations?.specialty.toLowerCase().replace(/\s+/g, '_'))}</p>
                                        </div>
                                    </div>
                                )) || <p className="text-gray-500 text-sm">{t("find_book_desc")}</p>}
                            </div>
                        </motion.div>
                    </div>

                </div>

                {/* Right Column (Reminders & Appointments) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Appointments Section */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-3xl border border-[#2563eb]/20 shadow-[0_0_30px_rgba(37,99,235,0.05)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#2563eb]/20 rounded-xl">
                                <Calendar className="w-5 h-5 text-[#2563eb]" />
                            </div>
                            <h2 className="text-lg font-bold text-white">{t("appointments")}</h2>
                        </div>

                        <div className="space-y-4">
                            {appointments.length > 0 ? appointments.map((app: any, i: number) => (
                                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#2563eb]/5 blur-xl group-hover:bg-[#2563eb]/10 transition-colors" />
                                    <div>
                                        <p className="font-bold text-sm">{app.doctorName}</p>
                                        <p className="text-xs text-[#00d6ff]">{t(app.specialty.toLowerCase().replace(/\s+/g, '_'))}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{app.hospital}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-300">
                                        <Clock className="w-3 h-3 text-[#2563eb]" />
                                        <span>{app.appointmentTime}</span>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button 
                                            onClick={() => handleUpdateStatus(app.doctorName, "cancelled")} 
                                            className="flex-1 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold border border-red-500/20 transition-all"
                                        >
                                            {t("cancel")}
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(app.doctorName, "completed")} 
                                            className="flex-1 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 text-[10px] font-bold border border-green-500/20 transition-all"
                                        >
                                            {t("complete")}
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-xs text-center py-4 italic">{t("no_appointments")}</p>
                            )}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-panel p-6 rounded-3xl border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.05)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-yellow-500/20 rounded-xl">
                                <Bell className="w-5 h-5 text-yellow-500" />
                            </div>
                            <h2 className="text-lg font-bold text-white">{t("medicines")}</h2>
                        </div>

                        <div className="relative border-l border-white/10 ml-3 space-y-6 pb-4">
                            <div className="relative pl-6">
                                <div className="absolute w-3 h-3 bg-yellow-500 rounded-full -left-1.5 top-1 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                                <p className="text-xs font-bold text-yellow-500 mb-1">08:00 AM</p>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <p className="text-sm font-bold">Paracetamol</p>
                                    <p className="text-xs text-gray-400">{t("pill_after_breakfast")}</p>
                                </div>
                            </div>

                            <div className="relative pl-6 text-gray-500 opacity-60">
                                <div className="absolute w-3 h-3 bg-gray-600 rounded-full -left-1.5 top-1" />
                                <p className="text-xs font-bold mb-1">02:00 PM</p>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <p className="text-sm font-bold">Vitamin C</p>
                                    <p className="text-xs">{t("pill_after_lunch")}</p>
                                </div>
                            </div>

                            <div className="relative pl-6 text-gray-500 opacity-60">
                                <div className="absolute w-3 h-3 bg-gray-600 rounded-full -left-1.5 top-1" />
                                <p className="text-xs font-bold mb-1">09:00 PM</p>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <p className="text-sm font-bold">Paracetamol</p>
                                    <p className="text-xs">{t("pill_after_dinner")}</p>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>

            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'} backdrop-blur-md`}>
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
