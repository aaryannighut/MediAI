"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    if (!email) {
        return (
            <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-2">Invalid Link</h2>
                <p className="text-gray-400 mb-8">This password reset link is invalid or has expired.</p>
                <Link href="/forgot-password" className="text-[#2563eb] font-bold hover:underline">Try Again</Link>
            </div>
        );
    }

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await api.post("/reset-password", { email, new_password: password });
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
        >
            {!success ? (
                <>
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold">New Password</h1>
                        <p className="text-gray-400 mt-2">Setting password for <span className="text-white font-bold">{email}</span></p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 pl-1">New Password</label>
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 pl-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Update Password <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                </>
            ) : (
                <div className="text-center py-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-2">Success!</h2>
                    <p className="text-gray-400 mb-8">Your password has been updated. You can now login with your new credentials. Redirecting to login...</p>
                    <Link
                        href="/login"
                        className="text-[#2563eb] font-bold hover:underline"
                    >
                        Click here if not redirected
                    </Link>
                </div>
            )}
        </motion.div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center p-4">
            <Link href="/" className="flex items-center gap-2 mb-12">
                <Activity className="h-8 w-8 text-[#00d6ff]" />
                <span className="text-3xl font-bold tracking-tight">MediAI</span>
            </Link>

            <div className="w-full max-w-md glass-panel p-8 rounded-3xl">
                <Suspense fallback={<div className="text-center py-10"><Loader2 className="w-10 h-10 animate-spin mx-auto text-[#2563eb]" /></div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
