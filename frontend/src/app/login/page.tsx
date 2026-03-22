"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/login", { email, password });
            localStorage.setItem("mediai_token", response.data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Login error:", err);
            
            if (err.message && err.message.includes("Backend not reachable")) {
                setError("Backend server is not running. Please start it.");
            } else {
                const detail = err.response?.data?.detail;
                setError(detail || "Login failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center p-4">
            <Link href="/" className="flex items-center gap-2 mb-12">
                <Activity className="h-8 w-8 text-[#00d6ff]" />
                <span className="text-3xl font-bold tracking-tight">MediAI</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass-panel p-8 rounded-3xl"
            >
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-gray-400 mt-2">Login to your secure health assistant</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 pl-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:border-[#2563eb] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center pr-1">
                            <label className="text-sm font-medium text-gray-400 pl-1">Password</label>
                            <Link href="/forgot-password" title="Verify through email" className="text-xs text-[#2563eb] hover:underline">Forgot Password?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 focus:outline-none focus:border-[#2563eb] transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Login <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-white font-bold hover:text-[#00d6ff] transition-colors">Create Account</Link>
                </div>
            </motion.div>
        </div>
    );
}
