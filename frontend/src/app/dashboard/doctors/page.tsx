"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Calendar, UserCheck, Home, Loader2, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function DoctorsPage() {
    const [search, setSearch] = useState("");
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [bookingDoc, setBookingDoc] = useState<any>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const { t } = useTranslation();

    const initialDoctors = [
        {
            id: 1,
            name: "Dr. Anthony Smith",
            specialty: "General Physician",
            hospital: "City Central Hospital",
            rating: 4.8,
            reviews: 124,
            image: "A",
            available: "Today, 4:00 PM",
            lat: 19.0821,
            lng: 72.8784
        },
        {
            id: 2,
            name: "Dr. Amanda Green",
            specialty: "Dermatologist",
            hospital: "Skin Care Clinic",
            rating: 4.9,
            reviews: 312,
            image: "A",
            available: "Tomorrow, 10:00 AM",
            lat: 19.1021,
            lng: 72.8884
        },
        {
            id: 3,
            name: "Dr. Robert Chen",
            specialty: "Cardiologist",
            hospital: "Heart Institute",
            rating: 5.0,
            reviews: 589,
            image: "R",
            available: "Thursday, 2:30 PM",
            lat: 19.0521,
            lng: 72.8284
        },
        {
            id: 4,
            name: "Dr. Elena Rossi",
            specialty: "Neurologist",
            hospital: "Neuro Center",
            rating: 4.7,
            reviews: 98,
            image: "E",
            available: "Today, 6:00 PM",
            lat: 19.1221,
            lng: 72.9084
        }
    ];

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log("Location denied", err)
            );
        }
    }, []);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const sortedDoctors = [...initialDoctors].sort((a, b) => {
        if (!userLoc) return 0;
        const distA = calculateDistance(userLoc.lat, userLoc.lng, a.lat, a.lng);
        const distB = calculateDistance(userLoc.lat, userLoc.lng, b.lat, b.lng);
        return distA - distB;
    }).filter(doc => 
        doc.name.toLowerCase().includes(search.toLowerCase()) || 
        doc.specialty.toLowerCase().includes(search.toLowerCase())
    );

    const handleBook = async () => {
        if (!bookingDoc) return;
        setIsBooking(true);
        try {
            await api.post("/appointments", {
                doctorName: bookingDoc.name,
                specialty: bookingDoc.specialty,
                hospital: bookingDoc.hospital,
                appointmentTime: bookingDoc.available
            });

            // Store in localStorage for immediate sync (Step 1)
            const appointment = {
                doctorName: bookingDoc.name,
                specialty: bookingDoc.specialty,
                hospital: bookingDoc.hospital,
                appointmentTime: bookingDoc.available,
                date: new Date().toISOString(),
                status: "booked" // Match backend status
            };
            const existing = JSON.parse(localStorage.getItem("appointments") || "[]");
            existing.push(appointment);
            localStorage.setItem("appointments", JSON.stringify(existing));

            setToast({ message: t("appointment_success"), type: "success" });
            setBookingDoc(null);
        } catch (err) {
            setToast({ message: t("appointment_failed"), type: "error" });
        } finally {
            setIsBooking(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 pb-32">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group" title="Back to Home">
                        <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("recommended_doctors")}</h1>
                        <p className="text-gray-400">
                            {userLoc ? t("finding_specialists") : t("find_book_desc")}
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <input 
                        type="text" 
                        placeholder={t("search_doctors")} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 pl-10 focus:outline-none focus:border-[#2563eb]" 
                    />
                    <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
                </div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 pt-4">
                {sortedDoctors.map((doc, i) => (
                    <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-[#2563eb]/50 transition-all group flex flex-col gap-6"
                    >
                        <div className="flex gap-4 items-start">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#00d6ff] flex items-center justify-center font-bold text-2xl text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
                                {doc.image}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">{doc.name}</h3>
                                        <p className="text-[#00d6ff] text-sm font-medium">{t(doc.specialty.toLowerCase().replace(/\s+/g, '_'))}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/5">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-bold">{doc.rating}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 mt-3 text-gray-400 text-sm">
                                    <MapPin className="w-4 h-4 text-[#00d6ff]" />
                                    <span>{doc.hospital}</span>
                                    {userLoc && (
                                        <span className="text-xs text-[#00d6ff] ml-auto font-bold">
                                            {calculateDistance(userLoc.lat, userLoc.lng, doc.lat, doc.lng).toFixed(1)} {t("km_away")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                            <div className="flex-1 flex items-center gap-2 text-sm text-gray-300">
                                <Calendar className="w-4 h-4 text-[#2563eb]" />
                                <span>{t("next_available")}: <strong>{doc.available}</strong></span>
                            </div>
                            <button 
                                onClick={() => setBookingDoc(doc)}
                                className="bg-white/10 hover:bg-[#2563eb] text-white px-6 py-2 rounded-xl transition-all font-medium text-sm border border-white/5 hover:border-[#2563eb] hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
                            >
                                <UserCheck className="w-4 h-4" /> {t("book")}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {bookingDoc && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel p-8 rounded-[2.5rem] max-w-md w-full border border-white/10 shadow-2xl space-y-6">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-[#2563eb]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-10 h-10 text-[#2563eb]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{t("confirm_appointment")}</h3>
                                <p className="text-gray-400">{t("confirm_appointment_with")} <strong>{bookingDoc.name}</strong>?</p>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-sm text-left space-y-2">
                                    <p className="text-gray-300"><span className="text-gray-500">{t("doctor")}:</span> {bookingDoc.name}</p>
                                    <p className="text-gray-300"><span className="text-gray-500">{t("specialty")}:</span> {t(bookingDoc.specialty.toLowerCase().replace(/\s+/g, '_'))}</p>
                                    <p className="text-gray-300"><span className="text-gray-500">{t("time")}:</span> {bookingDoc.available}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setBookingDoc(null)} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5">{t("cancel")}</button>
                                <button onClick={handleBook} disabled={isBooking} className="flex-1 py-4 rounded-2xl bg-[#2563eb] hover:bg-blue-600 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                                    {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : t("confirm")}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
