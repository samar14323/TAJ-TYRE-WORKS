"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Wrench,
  Shield,
  ThumbsUp,
  Award,
  ChevronDown,
  Play,
  ArrowUpRight,
  TrendingUp,
  Users,
  Compass,
  Star,
  Volume2,
  VolumeX,
  Keyboard,
  Info
} from "lucide-react";

import TyreCanvas from "@/components/Landing3D/TyreCanvas";
import TyreSizeFinder from "@/components/SizeFinder/TyreSizeFinder";
import Showroom3D from "@/components/Landing3D/Showroom3D";
import TyreComparison from "@/components/Landing3D/TyreComparison";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Initializing System...");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [gallerySliderVal, setGallerySliderVal] = useState(50); // For Before/After slider
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  
  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  // Cinematic Loading Messages
  useEffect(() => {
    if (loadingProgress < 20) {
      setLoadingMessage("Initializing 3D Workspace...");
    } else if (loadingProgress < 40) {
      setLoadingMessage("Loading Inventory Schema...");
    } else if (loadingProgress < 60) {
      setLoadingMessage("Calibrating Physics Simulators...");
    } else if (loadingProgress < 80) {
      setLoadingMessage("Arranging Virtual Tyre Showrooms...");
    } else if (loadingProgress < 95) {
      setLoadingMessage("Generating Dynamic Comparison Matrix...");
    } else {
      setLoadingMessage("Optimization Completed. Welcome Samar!");
    }
  }, [loadingProgress]);

  // Preloader count-up effect
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 800); // Give user time to read the final welcome
          return 100;
        }
        const step = Math.ceil((100 - prev) * 0.12 + 1);
        return Math.min(100, prev + step);
      });
    }, 55);

    return () => clearInterval(timer);
  }, []);

  // Web Audio Synthesizer Controls
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const startAmbientDrone = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      // Master gain
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.015, ctx.currentTime); // Keep hum very low, non-intrusive
      mainGain.connect(ctx.destination);
      droneGainRef.current = mainGain;

      // Base sine hum
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(60, ctx.currentTime); // 60Hz hum

      // Tremolo/modulator to simulate low fan/machine humming in garage
      const modulator = ctx.createOscillator();
      modulator.type = "sine";
      modulator.frequency.setValueAtTime(0.25, ctx.currentTime); // 0.25Hz cycle
      
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(1.5, ctx.currentTime);

      modulator.connect(modGain);
      modGain.connect(osc.frequency);

      osc.connect(mainGain);
      modulator.start();
      osc.start();
      
      droneOscRef.current = osc;
    } catch (err) {
      console.log("Audio node setup failed", err);
    }
  };

  const stopAmbientDrone = () => {
    if (droneOscRef.current) {
      try {
        droneOscRef.current.stop();
      } catch (e) {}
      droneOscRef.current = null;
    }
    if (droneGainRef.current) {
      droneGainRef.current.disconnect();
      droneGainRef.current = null;
    }
  };

  const toggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    if (nextState) {
      startAmbientDrone();
    } else {
      stopAmbientDrone();
    }
  };

  // Squeak tone feedback on clicks/hovers
  const playAudioClickFeedback = () => {
    if (!audioEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Simulated tiny squeak/beep for rubber wheel friction
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  const toggleFaq = (index: number) => {
    playAudioClickFeedback();
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Structured Data Schema for Local SEO
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "Taj Tyre Work",
    "image": "https://tajtyreworks.vercel.app/logo.png",
    "@id": "https://tajtyreworks.vercel.app",
    "url": "https://tajtyreworks.vercel.app",
    "telephone": "+919199936181",
    "email": "tajtyreworks05@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main GT Road, Near bypass crossing, Sector 5",
      "addressLocality": "G.T. Road bypass junction",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "28.6139",
      "longitude": "77.2090"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "09:00",
        "closes": "14:00"
      }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+919199936181",
      "contactType": "sales",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi", "Urdu"]
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#050507] flex flex-col items-center justify-center select-none">
        {/* Loading Spinner Ring */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute w-36 h-36 border-4 border-dashed border-amber-500/10 rounded-full"></div>
          <div className="absolute w-36 h-36 border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="w-24 h-24 rounded-full border-8 border-white/5 flex items-center justify-center animate-pulse">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 flex items-center justify-center text-xs font-mono font-bold text-amber-500">
              TAJ
            </div>
          </div>
        </div>

        <div className="mt-8 text-center px-4 max-w-sm">
          <h2 className="text-xl font-bold text-white font-mono tracking-widest text-glow">
            TAJ TYRE WORK
          </h2>
          <div className="min-h-[20px] mt-2">
            <p className="text-[10px] font-mono text-amber-500 tracking-wider uppercase">
              {loadingMessage}
            </p>
          </div>
          <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden mt-4 mx-auto">
            <div 
              className="h-full bg-amber-500 transition-all duration-100 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <span className="text-xs font-mono text-white/40 block mt-2">
            {loadingProgress}% SYSTEM INTEGRITY
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#f4f4f7] selection:bg-amber-500 selection:text-black font-sans scroll-smooth relative">
      {/* Inject Structured Data */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />

      {/* Background ambient details */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.035)_0%,transparent_70%)] pointer-events-none"></div>

      {/* Floating Audio Controller */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleAudio}
          className="p-3.5 rounded-full bg-[#12121a] hover:bg-[#1e1e2f] border border-amber-500/30 hover:border-amber-500 text-amber-500 shadow-2xl transition duration-300 flex items-center justify-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
          aria-label={audioEnabled ? "Disable Ambient Garage Audio" : "Enable Ambient Garage Audio"}
          title={audioEnabled ? "Mute Audio" : "Unmute Audio"}
        >
          {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-60" />}
        </button>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" onClick={playAudioClickFeedback}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.jpg" 
              alt="Taj Tyre Work Logo" 
              className="w-8 h-8 rounded-full object-cover border border-amber-500/35 group-hover:border-amber-500 transition shrink-0" 
            />
            <div>
              <span className="font-bold text-sm tracking-widest text-white block group-hover:text-amber-500 transition">
                TAJ TYRE WORK
              </span>
              <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest block -mt-0.5">
                Premium 3D Hub
              </span>
            </div>
          </Link>

          {/* Accessibility Keyboard Navigation Shortcut info */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-white/30 border border-white/5 px-2.5 py-1 rounded">
            <Keyboard className="w-3.5 h-3.5" />
            <span>TAB navigates focus</span>
          </div>

          {/* Links for desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#showroom" className="text-xs font-mono uppercase tracking-wider text-white/70 hover:text-amber-500 transition" onClick={playAudioClickFeedback}>
              Showroom
            </a>
            <a href="#size-finder" className="text-xs font-mono uppercase tracking-wider text-white/70 hover:text-amber-500 transition" onClick={playAudioClickFeedback}>
              Finder
            </a>
            <a href="#services" className="text-xs font-mono uppercase tracking-wider text-white/70 hover:text-amber-500 transition" onClick={playAudioClickFeedback}>
              Services
            </a>
            <a href="#comparison" className="text-xs font-mono uppercase tracking-wider text-white/70 hover:text-amber-500 transition" onClick={playAudioClickFeedback}>
              Compare
            </a>
            <a href="#reviews" className="text-xs font-mono uppercase tracking-wider text-white/70 hover:text-amber-500 transition" onClick={playAudioClickFeedback}>
              Reviews
            </a>
            <a href="#contact" className="text-xs font-mono uppercase tracking-wider text-white/70 hover:text-amber-500 transition" onClick={playAudioClickFeedback}>
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition shadow-lg shadow-amber-500/10 flex items-center gap-1 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 outline-none"
              onClick={playAudioClickFeedback}
            >
              Dashboard Portal
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 px-6 overflow-hidden">
        {/* Parallax background circles */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text (LHS: 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
            <div>
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-glow-sm">
                Trusted Since 2008
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              WELCOME TO <br />
              <span className="text-amber-500 text-glow">TAJ TYRE WORK</span>
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-lg leading-relaxed">
              Experience the pinnacle of automotive tyre management and services. We offer certified premium tyre brands, digital size profiling, computerized wheel alignment, and custom fleet management solutions.
            </p>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-4 mt-2">
              <a 
                href="#showroom" 
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-amber-500/20 focus:ring-2 focus:ring-amber-500 outline-none"
                onClick={playAudioClickFeedback}
              >
                Explore Stock
              </a>
              <a 
                href="#contact" 
                className="px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-white font-bold text-xs uppercase tracking-widest transition hover:bg-white/5 focus:ring-2 focus:ring-amber-500 outline-none"
                onClick={playAudioClickFeedback}
              >
                Contact Us
              </a>
            </div>

            {/* Floating stats block (Hero specific) */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                <div>
                  <span className="text-lg font-mono font-bold text-white block">5,000+</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Satisfied Clients</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                <div>
                  <span className="text-lg font-mono font-bold text-white block">20+</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Brands in Stock</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                <div>
                  <span className="text-lg font-mono font-bold text-white block">1,500+</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Tyres Available</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                <div>
                  <span className="text-lg font-mono font-bold text-white block">15+</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Years Experience</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 3D Canvas (RHS: 6 cols) */}
          <div className="lg:col-span-6 w-full h-full flex items-center justify-center">
            <TyreCanvas />
          </div>
        </div>
      </section>

      {/* Statistics section */}
      <section className="py-12 border-y border-white/5 bg-[#08080c]/50 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "15,000+", label: "Tyres Sold", icon: Award },
            { value: "4,200+", label: "Happy Vehicles", icon: Users },
            { value: "15+ Years", label: "Trusted Legacy", icon: Clock },
            { value: "4.9/5.0", label: "Google Rating", icon: Star }
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 border border-white/5 rounded-xl bg-cyber-gray/30 hover:border-amber-500/20 transition group">
              <div className="w-8 h-8 rounded-full bg-amber-500/5 border border-amber-500/10 flex items-center justify-center mx-auto mb-3 group-hover:border-amber-500/30 transition">
                <stat.icon className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-2xl md:text-3xl font-extrabold text-white block mb-1 font-mono tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs text-white/50 font-medium tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Brand scrolling ticker */}
      <section className="py-8 bg-black/60 overflow-hidden w-full select-none border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest text-center block">
            OFFICIAL DEALERS FOR TOP GLOBAL BRANDS
          </span>
        </div>
        <div className="relative flex overflow-x-hidden w-full">
          <div className="flex gap-16 py-3 whitespace-nowrap animate-ticker">
            {[
              "Apollo Tyres", "MRF Tyres", "CEAT Tyres", "JK Tyre", 
              "Birla Tyres", "Goodyear", "Michelin", "Bridgestone", "Yokohama"
            ].map((brand, idx) => (
              <span 
                key={`brand-1-${idx}`} 
                className="text-white/40 text-sm font-mono font-bold tracking-widest hover:text-amber-500 transition duration-300 cursor-pointer"
              >
                ★ {brand.toUpperCase()}
              </span>
            ))}
          </div>
          {/* Double buffer for infinite effect */}
          <div className="flex gap-16 py-3 whitespace-nowrap animate-ticker absolute top-0 left-full">
            {[
              "Apollo Tyres", "MRF Tyres", "CEAT Tyres", "JK Tyre", 
              "Birla Tyres", "Goodyear", "Michelin", "Bridgestone", "Yokohama"
            ].map((brand, idx) => (
              <span 
                key={`brand-2-${idx}`} 
                className="text-white/40 text-sm font-mono font-bold tracking-widest hover:text-amber-500 transition duration-300 cursor-pointer"
              >
                ★ {brand.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tyre Size Finder section */}
      <section id="size-finder" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block mb-2">
              Automated Fitment recommendation
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Not sure which size fits your vehicle?
            </h2>
            <p className="text-sm text-white/50 mt-2 max-w-xl mx-auto">
              Select your vehicle category, manufacturer, and model name to retrieve the original equipment recommended parameters.
            </p>
          </div>
          <TyreSizeFinder />
        </div>
      </section>

      {/* Showroom Section */}
      <section id="showroom" className="py-20 bg-cyber-gray-dark/40 border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block mb-2">
              Virtual Shelf Showroom
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Browse Available Tyre Stock
            </h2>
            <p className="text-sm text-white/50 mt-2 max-w-xl mx-auto">
              Hover over tyres in our interactive rack to explore compound details, tread lifespan indices, safety ratings, and estimated pricing.
            </p>
          </div>
          <Showroom3D />
        </div>
      </section>

      {/* Services section */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block mb-2">
              High Precision Garage Care
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Professional Tyre Services
            </h2>
            <p className="text-sm text-white/50 mt-2 max-w-xl mx-auto">
              Equipped with computerized machinery and calibrated sensors to guarantee optimal alignment, balancing, and tyre performance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Tyre Fitting", desc: "Automated scratch-free demounting and tyre fitment with specialized lock-clamps.", duration: "15 Mins" },
              { title: "Wheel Balancing", desc: "Digital wheel balancer calibrated to 0.5g precision. Corrects wobbles and shakes.", duration: "20 Mins" },
              { title: "Wheel Alignment", desc: "3D Camera Computerized Alignment. Restores factory steering geometry.", duration: "30 Mins" },
              { title: "Puncture Repair", desc: "Heavy-duty vulcanized mushroom patches for secure and long-term puncture fixes.", duration: "10 Mins" },
              { title: "Nitrogen Filling", desc: "98% pure Nitrogen filling. Prevents pressure fluctuations and rim oxidation.", duration: "5 Mins" },
              { title: "Tube Replacement", desc: "Thick premium butyl rubber tubes installed with strict bead sealing checks.", duration: "15 Mins" },
              { title: "Old Tyre Exchange", desc: "Get best buy-back valuations for worn tyres exchanged on new purchases.", duration: "Instant" },
              { title: "Emergency Service", desc: "On-site tyre service and towing dispatch within a 15km radius of the shop.", duration: "Varies" }
            ].map((srv, idx) => (
              <div 
                key={idx} 
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition group relative overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 outline-none"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && playAudioClickFeedback()}
              >
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition pointer-events-none"></div>

                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-white/5 flex items-center justify-center mb-4 group-hover:border-amber-500/30 transition">
                    <Wrench className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{srv.title}</h4>
                  <p className="text-xs text-white/50 leading-relaxed mb-4">{srv.desc}</p>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-4 text-[10px] font-mono">
                  <span className="text-white/40">ESTIMATED TIME</span>
                  <span className="text-amber-500 font-semibold">{srv.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison section */}
      <section id="comparison" className="py-20 bg-cyber-gray-dark/40 border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block mb-2">
              Side-by-Side Assessment
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Compare Before You Buy
            </h2>
            <p className="text-sm text-white/50 mt-2 max-w-xl mx-auto">
              Analyze parameters of top-selling tyres side-by-side. Compare warranty terms, wet grip indexes, structural compound stiffness, and prices.
            </p>
          </div>
          <TyreComparison />
        </div>
      </section>

      {/* Interactive Before/After Gallery Slider */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block mb-2">
              Precision Workmanship
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Before & After Wheel Restoration
            </h2>
            <p className="text-sm text-white/50 mt-2 max-w-xl mx-auto">
              Slide the slider left and right to inspect our restoration precision: worn-out tread and oxidized alloys vs fresh fitment and balanced alignment.
            </p>
          </div>

          <div className="w-full max-w-3xl mx-auto aspect-video relative rounded-2xl overflow-hidden border border-white/10 group shadow-2xl select-none">
            {/* After Image Container (Full screen) */}
            <div className="absolute inset-0 bg-zinc-950 flex flex-col justify-center items-center p-8 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)]">
              <span className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/20">
                AFTER RESTORATION & ALIGNMENT
              </span>
              <div className="w-64 h-64 rounded-full border-[12px] border-zinc-800 flex items-center justify-center shadow-2xl relative">
                <div className="w-40 h-40 rounded-full border-4 border-amber-500/20 flex items-center justify-center font-bold text-white font-mono text-center">
                  <div>
                    <span className="text-sm block">APOLLO</span>
                    <span className="text-xs text-amber-500">ALNAC 4G</span>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-emerald-400/40"></div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs font-bold text-white">Brand New Tread & Polished Rim</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Laser Balanced to 0.0g</p>
              </div>
            </div>

            {/* Before Image Container (Clipped) */}
            <div 
              className="absolute inset-0 bg-zinc-900 flex flex-col justify-center items-center p-8 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06)_0%,transparent_60%)] overflow-hidden border-r border-amber-500"
              style={{ width: `${gallerySliderVal}%` }}
            >
              <div className="absolute inset-0 w-[768px] h-[432px] flex flex-col justify-center items-center pointer-events-none" style={{ width: "768px" }}>
                <span className="absolute top-4 left-4 bg-rose-500/10 text-rose-400 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-rose-500/20">
                  BEFORE SERVICE
                </span>
                <div className="w-64 h-64 rounded-full border-[12px] border-zinc-900 flex items-center justify-center opacity-65 relative">
                  <div className="w-40 h-40 rounded-full border-4 border-dashed border-zinc-800 flex items-center justify-center font-bold text-zinc-600 font-mono text-center">
                    <div>
                      <span className="text-sm block">WORN OUT</span>
                      <span className="text-xs text-rose-500">12% TREAD</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-zinc-500">Uneven Tread Wear & Rust Oxidations</p>
                  <p className="text-[10px] text-rose-400 font-mono mt-0.5">Severe Pulling Left (Alignment Bad)</p>
                </div>
              </div>
            </div>

            {/* Range Input overlay */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={gallerySliderVal} 
              onChange={(e) => {
                setGallerySliderVal(Number(e.target.value));
                playAudioClickFeedback();
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              aria-label="Before and After tyre restoration slider gauge"
            />

            {/* Slider bar thumb handle visual */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500 pointer-events-none z-10"
              style={{ left: `${gallerySliderVal}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#050507] border border-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-amber-500">↔</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews section */}
      <section id="reviews" className="py-20 bg-cyber-gray-dark/40 border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block mb-2">
              Verified Testimonials
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              What Customers Say About Us
            </h2>
            <p className="text-sm text-white/50 mt-2 max-w-xl mx-auto">
              Read transparent reviews from private car owners, transport operators, and commercial fleet managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Rahul Sharma", role: "Honda City Owner", text: "Got Apollo tyres installed. Samar advised me on the size difference and computer alignment. The car runs very smooth on highways now. Appreciate the transparency!", stars: 5 },
              { name: "Vikas Yadav", role: "Truck Fleet Coordinator", text: "Taj Tyre Works handles our bulk tractor and truck radial purchases. Invoicing is GST-ready, barcode tracking is perfect, and bulk pricing is highly competitive.", stars: 5 },
              { name: "Anish Qureshi", role: "Royal Enfield Rider", text: "Highly recommend for tyre balancing. Their computerized balance machines spotted a weight offset that others missed. Very professional staff and quick repair.", stars: 5 }
            ].map((rev, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative">
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: rev.stars }).map((_, sIdx) => (
                      <Star key={sIdx} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-white/70 italic leading-relaxed mb-6">
                    "{rev.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-auto">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-amber-500 font-mono">
                    {rev.name[0]}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{rev.name}</h5>
                    <span className="text-[10px] text-white/40 block">{rev.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video review simulation */}
          <div className="mt-12 text-center">
            <span className="text-xs text-white/40 block mb-4 uppercase font-mono tracking-wider animate-pulse">
              Click below to view customer video reviews
            </span>
            <div className="flex flex-wrap justify-center gap-4">
              {["Watch Rahul's Review (0:45)", "Watch Vikas's Review (1:12)"].map((vid, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveVideoIndex(idx);
                    playAudioClickFeedback();
                  }}
                  className="px-4 py-2 text-xs rounded-lg border border-white/10 hover:border-amber-500/40 bg-white/5 hover:bg-amber-500/5 text-white/80 hover:text-white transition flex items-center gap-2 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {vid}
                </button>
              ))}
            </div>

            {activeVideoIndex !== null && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label="Customer Video Review">
                <div className="bg-cyber-gray-dark border border-white/10 p-6 rounded-2xl max-w-md w-full relative">
                  <button 
                    onClick={() => {
                      setActiveVideoIndex(null);
                      playAudioClickFeedback();
                    }}
                    className="absolute top-4 right-4 text-xs bg-white/5 px-2.5 py-1 rounded text-white/60 hover:text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  >
                    Close
                  </button>
                  <div className="aspect-video w-full bg-zinc-950 rounded-lg flex flex-col items-center justify-center border border-white/5 mt-4">
                    <Star className="w-8 h-8 text-amber-500 animate-bounce mb-2" />
                    <p className="text-xs text-white/80 font-mono">Simulated Video Player</p>
                    <p className="text-[10px] text-white/40 mt-1">Review playback rendering dynamically...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block mb-2">
              Help Center & FAQ
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "How often should I align my vehicle wheels?", a: "We recommend professional computerized alignment checks every 5,000 to 7,000 kilometers, or immediately if you feel steering drift, vehicle pulling to one side, or notice uneven tyre wear patterns." },
              { q: "What are the benefits of filling Nitrogen over regular air?", a: "Nitrogen has larger molecules than standard oxygen, leaking 3-4 times slower. It reduces pressure fluctuations, runs cooler on expressways, increases fuel efficiency, and prevents rim oxidation since it is moisture-free." },
              { q: "How can I verify the warranty on my tyres purchased from Taj?", a: "Every tyre purchase is logged under your phone number in our invoice database. Customers can log in to the Customer Portal using their phone number to check remaining warranty months, claims status, and download original invoices." },
              { q: "Do you offer buy-back value for old tyres?", a: "Yes, we evaluate old tyre conditions (casing strength, tread depth) and offer competitive buy-back deductions off the total bill for your new replacement tyres." }
            ].map((faq, i) => (
              <div 
                key={i} 
                className="bg-cyber-gray/40 border border-white/5 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full py-4 px-5 text-left flex justify-between items-center text-xs font-bold text-white hover:bg-white/5 transition focus:ring-2 focus:ring-inset focus:ring-amber-500 outline-none"
                  aria-expanded={activeFaq === i}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-[#0a0a0f]/60"
                    >
                      <p className="p-5 text-xs text-white/60 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section id="contact" className="py-20 bg-cyber-gray-dark/40 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block mb-2">
              Connect With Us
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Visit Taj Tyre Work
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Details panel (Left: 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 border border-white/5 relative">
                <div className="flex gap-3.5 items-start">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">PHYSICAL ADDRESS</span>
                    <span className="text-xs font-semibold text-white">
                      Main GT Road, Near bypass crossing, Sector 5, India
                    </span>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start border-t border-white/5 pt-4">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">BUSINESS HOURS</span>
                    <span className="text-xs font-semibold text-white block">
                      Monday - Saturday: 9:00 AM - 8:00 PM
                    </span>
                    <span className="text-[11px] text-amber-500 font-semibold block mt-0.5">
                      Sunday: 9:00 AM - 2:00 PM
                    </span>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start border-t border-white/5 pt-4">
                  <Phone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">CALL DIRECT</span>
                    <a href="tel:9199936181" className="text-xs font-bold text-white hover:text-amber-500 transition block focus:ring-1 focus:ring-amber-500 outline-none">
                      +91 9199936181
                    </a>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start border-t border-white/5 pt-4">
                  <MessageSquare className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">WHATSAPP CHAT</span>
                    <a 
                      href="https://wa.me/919199936181" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-white hover:text-amber-500 transition block focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      Click to chat with Mohammad Samar
                    </a>
                  </div>
                </div>
              </div>

              {/* Instant Quotation Generator Link card */}
              <div className="p-5 bg-gradient-to-tr from-amber-600/10 to-amber-500/0 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-amber-500 uppercase tracking-wider block">
                    Instant Pricing Estimation
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">Get an Online Quotation</h4>
                  <p className="text-xs text-white/50 leading-relaxed mt-0.5">Select tyres and download pricing breakdown instantly.</p>
                </div>
                <Link 
                  href="/login" 
                  className="p-2 bg-amber-500 text-black hover:bg-amber-600 rounded-lg transition focus:ring-2 focus:ring-amber-500 outline-none"
                  onClick={playAudioClickFeedback}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Map panel (Right: 7 cols) */}
            <div className="lg:col-span-7 h-[360px] w-full rounded-2xl overflow-hidden border border-white/5 bg-cyber-gray-dark/50 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-zinc-950 flex flex-col justify-center items-center p-6 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.02)_0%,transparent_60%)]">
                <MapPin className="w-8 h-8 text-amber-500 animate-bounce mb-3" />
                <h4 className="text-sm font-bold text-white font-mono">TAJ TYRE WORKS MAP VIEW</h4>
                <p className="text-xs text-white/50 mt-1 font-mono text-center">G.T. Road bypass junction, Opp. Metro Pillar 42</p>
                <div className="w-48 h-[1px] bg-white/5 my-4"></div>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/40 text-white font-semibold text-xs tracking-wider transition hover:bg-amber-500/5 flex items-center gap-1.5 focus:ring-2 focus:ring-amber-500 outline-none"
                  onClick={playAudioClickFeedback}
                >
                  Open in Google Maps
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cyber-black py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-bold text-sm text-white tracking-widest block font-mono">
              TAJ TYRE WORK
            </span>
            <span className="text-[10px] text-white/40 block mt-1 font-mono">
              Premium 3D Tyre Business Management Website
            </span>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right font-mono">
            <span className="text-[10px] text-white/50 block">ADMINISTRATOR DETAILS</span>
            <span className="text-xs font-bold text-white mt-1">Mohammad Samar (Owner)</span>
            <span className="text-[11px] text-white/70 block mt-0.5">Mobile: +91 9199936181</span>
            <span className="text-[11px] text-amber-500 block hover:underline">
              <a href="mailto:tajtyreworks05@gmail.com">tajtyreworks05@gmail.com</a>
            </span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/40 font-mono">
          <span>&copy; {new Date().getFullYear()} Taj Tyre Work. All Rights Reserved.</span>
          <span className="mt-2 md:mt-0 flex gap-4">
            <Link href="/login" className="hover:text-amber-500" onClick={playAudioClickFeedback}>Owner Portal</Link>
            <Link href="/login" className="hover:text-amber-500" onClick={playAudioClickFeedback}>Employee Portal</Link>
            <Link href="/login" className="hover:text-amber-500" onClick={playAudioClickFeedback}>Customer Portal</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
