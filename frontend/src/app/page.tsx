"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Activity, Mic, Bell, HeartPulse, ShieldCheck, ArrowRight, UserCheck, Stethoscope, AlertTriangle, MessageSquare, ActivitySquare, Mail, MapPin, Github, Twitter, Linkedin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  const [frameIndex, setFrameIndex] = useState(1);
  const totalFrames = 240;

  useEffect(() => {
    // Preload images for smoother animation
    for (let i = 1; i <= Math.min(50, totalFrames); i++) {
      const img = new Image();
      img.src = `/landing_images/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`;
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll <= 0) return;

      const scrollFraction = scrollTop / maxScroll;
      const frame = Math.max(1, Math.min(totalFrames, Math.floor(scrollFraction * totalFrames) + 1));

      setFrameIndex(frame);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Init

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentImage = `/landing_images/ezgif-frame-${frameIndex.toString().padStart(3, '0')}.jpg`;

  return (
    <div className="min-h-screen text-[#f9fafb] selection:bg-[#2563eb] selection:text-white relative">

      {/* VIDEO BACKGROUND (Image Sequence) */}
      <img
        src={currentImage}
        alt="AI Background Sequence"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center center",
          transform: "translateY(0)",
          zIndex: -1,
          filter: "brightness(0.85) contrast(1.05) saturate(1.1)",
          animation: "slowZoom 20s ease-in-out infinite alternate"
        }}
      />
      {/* Dark gradient overlay to maintain text readability */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, rgba(5,5,5,0.35), rgba(5,5,5,0.55))",
          zIndex: -1
        }}
      />

      <Navbar />

      {/* SECTION: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto flex flex-col items-center gap-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-[#00d6ff] font-medium border border-[#00d6ff]/30 shadow-[0_0_15px_rgba(0,214,255,0.2)]">
            <Activity className="w-4 h-4" />
            <span>Premium Healthcare AI</span>
          </div>

          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}
          >
            Medi<span className="text-[#2563eb]">AI</span> <br />
            <span className="text-3xl md:text-5xl lg:text-6xl text-gray-200 block mt-2">Personal Health Assistant</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mt-4">
            Early detection. Smart health insights. Better decisions.
            Take control of your health with cutting-edge artificial intelligence designed to assist diagnosis, monitor health risks, and guide medical decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
            <Link href="/dashboard/symptoms" className="bg-[#2563eb] hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2 w-full sm:w-auto">
              Start Health Check <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="glass-panel text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/10 w-full sm:w-auto flex items-center justify-center">
              See How It Works
            </Link>
          </div>
        </motion.div>
      </section>

      {/* SECTION: FEATURES GRID */}
      <div id="features" className="max-w-7xl mx-auto px-4 py-32 space-y-32">

        {/* ROW 1: AI Diagnosis & Risk Level Detection */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 md:p-10 rounded-3xl group hover:border-[#2563eb]/50 transition-colors"
          >
            <div className="p-4 bg-[#2563eb]/20 rounded-2xl w-max mb-6 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
              <ActivitySquare className="w-8 h-8 text-[#2563eb]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">AI Diagnosis</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Our advanced machine learning engine analyzes your symptoms, medical history, and vital factors to predict potential diseases with extreme accuracy. Fast, private, and precise.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 md:p-10 rounded-3xl group hover:border-yellow-500/50 transition-colors"
          >
            <div className="p-4 bg-yellow-500/20 rounded-2xl w-max mb-6 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Risk Level Detection</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              We classify your health status into Low, Medium, and High risk profiles. Our real-time emergency alert systems instantly warn you if immediate medical intervention is critical.
            </p>
          </motion.div>
        </div>

        {/* ROW 2: Doctor Recommendation & AI Health Chatbot */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 md:p-10 rounded-3xl group hover:border-[#00d6ff]/50 transition-colors"
          >
            <div className="p-4 bg-[#00d6ff]/20 rounded-2xl w-max mb-6 group-hover:shadow-[0_0_20px_rgba(0,214,255,0.4)] transition-all">
              <UserCheck className="w-8 h-8 text-[#00d6ff]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Doctor Recommendation</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Navigating healthcare specialists can be overwhelming. MediAI instantly connects you with the exact right type of expert locally, from Cardiologists to Dermatologists.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 md:p-10 rounded-3xl group hover:border-purple-500/50 transition-colors"
          >
            <div className="p-4 bg-purple-500/20 rounded-2xl w-max mb-6 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">AI Health Chatbot</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Consult with our brilliant Conversational AI assistant 24/7. Describe your discomfort, ask health questions, and retrieve actionable precautions naturally and securely.
            </p>
          </motion.div>
        </div>

        {/* ROW 3: Tri-Grid (Voice, Score, Family) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-all"
          >
            <div className="p-3 bg-red-500/20 rounded-2xl w-max mb-6">
              <Mic className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Voice Symptom Input</h3>
            <p className="text-gray-400">
              Speak your symptoms directly to MediAI. Our speech-to-text algorithm transcribes and interprets your needs effortlessly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-all flex flex-col items-center text-center"
          >
            <div className="relative w-20 h-20 mb-6">
              <svg viewBox="0 0 36 36" className="w-full h-full stroke-green-500" fill="none" strokeWidth="3" strokeLinecap="round">
                <path className="stroke-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path strokeDasharray="85, 100" className="stroke-green-500 shadow-[0_0_10px_green]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold text-white">85</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Health Score System</h3>
            <p className="text-gray-400">
              Monitor your wellbeing dynamically. Your personalized score adapts based on lifestyle, history, and active symptoms.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-all md:col-span-2 lg:col-span-1"
          >
            <div className="p-3 bg-[#2563eb]/20 rounded-2xl w-max mb-6">
              <ShieldCheck className="w-6 h-6 text-[#2563eb]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Family Health Profiles</h3>
            <p className="text-gray-400">
              Manage secure, isolated medical records for your entire family, from children to parents, all under one master account.
            </p>
          </motion.div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-[#020202]/95 border-t border-white/10 relative z-10 pt-20 pb-10 px-4 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">

          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-[#00d6ff]" />
              <span className="text-2xl font-bold tracking-tight text-white">MediAI</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              Revolutionizing personal healthcare management with cutting-edge artificial intelligence, empowering users globally.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2563eb] transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#00d6ff] transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About MediAI</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">AI Diagnosis</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Health Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Doctor Recommendations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Medicine Reminder</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Resources</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Health Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex flex-col md:flex-row items-center md:gap-8 gap-4 text-gray-400 text-sm w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:support@mediai.ai" className="hover:text-white transition-colors">support@mediai.ai</a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Mumbai, India</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500 w-full md:w-auto justify-center md:justify-end">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Medical Disclaimer</a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto text-center mt-10 text-xs text-gray-500 space-y-2">
          <p>© 2026 MediAI. All rights reserved.</p>
          <p className="italic max-w-2xl mx-auto text-gray-600">
            "MediAI provides AI-assisted health insights and does not replace professional medical diagnosis."
          </p>
        </div>

      </footer>
    </div>
  );
}
