"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Volume2, Bot, Sparkles, ArrowRight, ShieldCheck, HeartPulse, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import TextTransition, { presets } from "react-text-transition";
import { Badge } from "@/components/ui/badge";

const INTRO_TEXTS = [
  "Welcome to Care+ 👋",
  "I'm your Personal Health Ally",
  "Powered by Advanced Medical AI",
  "Let's secure your health journey",
  "Ready to provide expert guidance",
];

export function AIAvatarIntro({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  const [mouthY, setMouthY] = useState(0);
  
  // Web Speech API refs
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize Speech
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const voices = synthesisRef.current?.getVoices() || [];
        // Try to find a premium/natural sounding voice
        const preferred = voices.find(v => v.name.includes("Google") || v.name.includes("Premium")) || voices[0];
        voiceRef.current = preferred;
      };
      loadVoices();
      if (synthesisRef.current?.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Simulate loading and initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Auto-start greeting after short delay
      setTimeout(() => speak(INTRO_TEXTS[0], 0), 1000);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Text transition auto-cycle when not forced by speaking steps
  useEffect(() => {
    if (!isSpeaking) {
      const interval = setInterval(() => {
        setTextIndex((prev) => (prev + 1) % INTRO_TEXTS.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isSpeaking]);

  const speak = (text: string, nextStep?: number) => {
    if (!synthesisRef.current) return;
    
    // Stop any current speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    
    utterance.pitch = 1.1;
    utterance.rate = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (nextStep !== undefined) setTextIndex(nextStep);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (nextStep !== undefined) setStep(Math.max(step, nextStep + 1));
      setMouthY(0);
    };

    // Mouth animation sync (rough approximation)
    const animInterval = setInterval(() => {
      if (synthesisRef.current?.speaking) {
        setMouthY(Math.random() * 10);
      } else {
        clearInterval(animInterval);
      }
    }, 100);

    synthesisRef.current.speak(utterance);
  };

  const handleStepAction = (idx: number) => {
    const texts = [
      "Hello! I am your AI health ally. I'm here to ensure you get the best medical guidance, personalized for your needs.",
      "You can easily book appointments, manage your medications, and view lab results all from one secure place.",
      "Everything is set up! You now have full access to your personalized health dashboard. Let's begin!"
    ];
    speak(texts[idx], idx);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="relative">
             <div className="w-40 h-40 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
                <Bot className="w-20 h-20 text-primary animate-bounce" />
             </div>
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="absolute -top-4 -right-4"
             >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-md">
                   <Sparkles className="w-6 h-6 text-primary" />
                </div>
             </motion.div>
          </div>
          <div className="mt-12 text-center space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
              Initializing AI Intelligence
            </h2>
            <p className="text-slate-400 font-medium">Calibrating neural health networks...</p>
          </div>
          <div className="mt-10 w-72 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-indigo-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "circIn" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-slate-950 p-6 md:p-12 relative overflow-hidden flex flex-col"
      >
        {/* Abstract Background Decor */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />

        {/* Header */}
        <div className="flex justify-between items-center relative z-10 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight block">CARE+ AI</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Digital Healthcare Unit</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-tight">System Online</span>
            </div>
            {isSpeaking && (
               <div className="flex gap-1 h-4 items-end">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["20%", "100%", "20%"] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-primary rounded-full"
                    />
                  ))}
               </div>
            )}
          </div>
        </div>

        {/* Main Interface Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            
            {/* Left: Interactive Avatar */}
            <div className="flex flex-col items-center justify-center relative">
              
              {/* Avatar Shield/Pod */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-[4rem] bg-slate-900 border-2 border-slate-800 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex items-center justify-center overflow-hidden group">
                   
                   {/* Inner Mech Detail */}
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
                   
                   {/* SVG Avatar Face */}
                   <div className="relative flex flex-col items-center">
                      <div className="flex gap-10 mb-10">
                         {/* Animated Eyes */}
                         {[0, 1].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ 
                                scaleY: [1, 1, 0.1, 1],
                                opacity: isSpeaking ? [0.8, 1, 0.8] : 0.8
                              }}
                              transition={{ 
                                scaleY: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] },
                                opacity: { duration: 0.2, repeat: isSpeaking ? Infinity : 0 }
                              }}
                              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                            >
                               <div className="w-3 h-3 bg-white rounded-full opacity-50 blur-[1px]" />
                            </motion.div>
                         ))}
                      </div>

                      {/* Animated Mouth/Wave */}
                      <motion.div 
                        animate={isSpeaking ? {
                          width: ["2rem", "4rem", "2rem"],
                          height: ["0.5rem", `${0.5 + mouthY/5}rem`, "0.5rem"],
                          borderRadius: ["100%", "20%", "100%"]
                        } : {
                           width: "2.5rem",
                           height: "0.4rem",
                           borderRadius: "100%"
                        }}
                        transition={{ duration: 0.15 }}
                        className="bg-primary/80 blur-[1px]"
                      />
                   </div>
                </div>

                {/* Satellite Elements */}
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className="absolute -inset-8 pointer-events-none"
                >
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-lg bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                   </div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-lg bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] flex items-center justify-center">
                      <HeartPulse className="w-4 h-4 text-white" />
                   </div>
                </motion.div>
              </motion.div>

              {/* Status Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-slate-800 rounded-full opacity-20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-slate-900 rounded-full opacity-10 pointer-events-none" />
            </div>

            {/* Right: Message & Interaction */}
            <div className="space-y-10">
              
              <div className="space-y-4">
                 <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-[0.2em] px-4 py-1">
                    Neural Identity Matrix
                 </Badge>
                 <div className="h-24 flex items-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                      <TextTransition springConfig={presets.gentle}>
                        {INTRO_TEXTS[textIndex % INTRO_TEXTS.length]}
                      </TextTransition>
                    </h2>
                 </div>
                 <p className="text-slate-400 text-lg max-w-md">
                    Access high-density medical insights and secure health management protocols through your personalized AI hub.
                 </p>
              </div>

              {/* Steps Component */}
              <div className="space-y-3">
                 {[
                   { id: 0, icon: Bot, label: "Care Calibration", desc: "Syncing your health profile" },
                   { id: 1, icon: Zap, label: "Health Intelligence", desc: "Activating expert guidance" },
                   { id: 2, icon: CheckCircle, label: "Access Granted", desc: "Your dashboard is ready" },
                 ].map((item, i) => (
                   <motion.div 
                     key={i}
                     onClick={() => handleStepAction(i)}
                     className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                        step > i ? "bg-emerald-500/10 border-emerald-500/20" : 
                        step === i ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20 shadow-lg" : 
                        "bg-slate-900 border-slate-800 hover:border-slate-700"
                     }`}
                   >
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        step > i ? "bg-emerald-500 text-white" : 
                        step === i ? "bg-primary text-white" : 
                        "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                     }`}>
                        <item.icon className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <span className={`text-sm font-bold ${step === i ? 'text-white' : 'text-slate-300'}`}>{item.label}</span>
                           {step > i && <span className="text-[10px] text-emerald-500 font-black uppercase">Active</span>}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{item.desc}</span>
                     </div>
                   </motion.div>
                 ))}
              </div>

              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 1 }}
              >
                <Button 
                   onClick={onComplete}
                   size="lg"
                   className="w-full sm:w-auto px-10 py-8 text-xl font-black rounded-3xl bg-primary hover:bg-primary/90 text-white shadow-[0_20px_40px_rgba(59,130,246,0.25)] hover:shadow-[0_25px_50px_rgba(59,130,246,0.35)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                   ENTER SYSTEM COMMAND
                   <ArrowRight className="w-6 h-6" />
                </Button>
                <p className="mt-4 text-slate-500 text-xs text-center sm:text-left font-bold uppercase tracking-widest pl-4">
                   Authenticated Encryption Enabled
                </p>
              </motion.div>

            </div>

          </div>

        </div>

        {/* Footer info */}
        <div className="mt-auto pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-900/50">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 opacity-50">
                 <ShieldCheck className="w-4 h-4 text-primary" />
                 <span className="text-[10px] text-slate-400 font-bold uppercase">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                 <Zap className="w-4 h-4 text-amber-500" />
                 <span className="text-[10px] text-slate-400 font-bold uppercase">v2.0 Core</span>
              </div>
           </div>
           <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tighter">
              &copy; 2026 Care+ Intelligent Health Systems. All neural pathways protected.
           </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

