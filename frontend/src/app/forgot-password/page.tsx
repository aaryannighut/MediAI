"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/forgot-password", { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Email address not found.");
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
                {!success ? (
                    <>
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold">Reset Password</h1>
                            <p className="text-gray-400 mt-2">Enter your email and we'll help you secure your account.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-6">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verify Email <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Email Verified</h2>
                        <p className="text-gray-400 mb-8">We've verified your email. Please click below to set your new secure password.</p>
                        <Link
                            href={`/reset-password?email=${email}`}
                            className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] inline-flex items-center gap-2"
                        >
                            Set New Password <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}

                <div className="mt-8 text-center text-gray-400 text-sm">
                    Remembered your password?{" "}
                    <Link href="/login" className="text-white font-bold hover:text-[#00d6ff] transition-colors">Login Here</Link>
                </div>
            </motion.div>
        </div>
    );
}
