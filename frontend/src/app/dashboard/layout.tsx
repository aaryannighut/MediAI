"use client";

import { Activity, LayoutDashboard, Stethoscope, MessageSquare, Clock, Users, Settings, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

interface UserProfile {
    name: string;
    email: string;
    age: number;
    gender: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value;
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
    };

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("mediai_token") : null;
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await api.get("/user-profile");
                setUser(response.data);
            } catch (err) {
                // Interceptor will handle status 401
            }
        };
        fetchUser();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("mediai_token");
        router.push("/");
    };

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Symptom Checker", href: "/dashboard/symptoms", icon: Stethoscope },
        { name: "Chatbot", href: "/dashboard/chat", icon: MessageSquare },
        { name: "Doctors", href: "/dashboard/doctors", icon: Stethoscope },
        { name: "History", href: "/dashboard/history", icon: Clock },
    ];

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-[#ffffff10]">
                <div className="p-6 flex items-center gap-2">
                    <Activity className="h-6 w-6 text-[#00d6ff]" />
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        Medi<span className="text-gradient">AI</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex gap-3 items-center px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#2563eb] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{t(link.name.toLowerCase().replace(" ", "_"))}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/5">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Language</span>
                        <select 
                            className="bg-transparent text-sm text-gray-300 outline-none border-none cursor-pointer"
                            value={i18n.language}
                            onChange={handleLanguageChange}
                        >
                            <option value="en" className="bg-[#050505]">English</option>
                            <option value="hi" className="bg-[#050505]">हिंदी (Hindi)</option>
                            <option value="mr" className="bg-[#050505]">मराठी (Marathi)</option>
                        </select>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:text-red-400 w-full rounded-xl hover:bg-white/5 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {t("logout")}
                    </button>

                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="text-xs overflow-hidden">
                            <p className="font-bold text-white truncate">{user?.name || "Loading..."}</p>
                            <p className="text-gray-500">{user ? t("premium_user") : ""}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 glass-panel sticky top-0 z-40 w-full text-white">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 bg-white/5 rounded-lg border border-white/10"
                        >
                            <Menu className="h-5 w-5 text-[#00d6ff]" />
                        </button>
                        <Link href="/dashboard" className="font-bold text-lg tracking-tight">
                            Medi<span className="text-gradient">AI</span>
                        </Link>
                    </div>
                    <button onClick={handleLogout} className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-500">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>

                {/* Mobile Drawer (Sidebar) */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            {/* Overlay */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                            />
                            
                            {/* Drawer */}
                            <motion.aside 
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 left-0 w-72 bg-[#0a0a0a] border-r border-white/10 z-[70] md:hidden flex flex-col shadow-2xl"
                            >
                                <div className="p-6 flex items-center justify-between border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-6 w-6 text-[#00d6ff]" />
                                        <span className="text-xl font-bold">Medi<span className="text-gradient">AI</span></span>
                                    </div>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                    {links.map((link) => {
                                        const isActive = pathname === link.href;
                                        const Icon = link.icon;
                                        return (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex gap-3 items-center px-4 py-4 rounded-xl transition-all ${isActive ? 'bg-[#2563eb] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{t(link.name.toLowerCase().replace(" ", "_"))}</span>
                                            </Link>
                                        )
                                    })}
                                </nav>

                                <div className="p-4 border-t border-white/5 space-y-4">
                                    <div className="flex items-center justify-between px-2 pb-2">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t("language")}</span>
                                        <select 
                                            className="bg-transparent text-sm text-[#00d6ff] outline-none border-none cursor-pointer font-medium"
                                            value={i18n.language}
                                            onChange={handleLanguageChange}
                                        >
                                            <option value="en" className="bg-[#050505]">English</option>
                                            <option value="hi" className="bg-[#050505]">हिंदी (Hindi)</option>
                                            <option value="mr" className="bg-[#050505]">मराठी (Marathi)</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-sm font-bold">
                                            {user?.name?.charAt(0) || "U"}
                                        </div>
                                        <div className="text-xs overflow-hidden flex-1">
                                            <p className="font-bold text-white truncate">{user?.name || "Loading..."}</p>
                                            <p className="text-gray-500">{user ? t("premium_user") : ""}</p>
                                        </div>
                                        <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 w-full glass-panel border-t border-white/10 flex justify-around p-3 pb-8 z-50">
                {links.slice(0, 5).map(link => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link key={link.name} href={link.href} className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#00d6ff]' : 'text-gray-500'}`}>
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] font-medium">{t(link.name.toLowerCase().replace(" ", "_"))}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}
