"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  Award,
  Calendar,
  Car,
  ShieldCheck,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  Compass
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  badgeCount?: number;
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Client");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("ttw_currentUserName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ttw_currentUserRole");
    localStorage.removeItem("ttw_currentUserName");
    localStorage.removeItem("ttw_currentUserPhone");
    router.push("/login");
  };

  const navItems: SidebarItem[] = [
    { name: "Home Dashboard", href: "/customer", icon: LayoutDashboard },
    { name: "Available Stock", href: "/customer/stock", icon: Store },
    { name: "Loyalty Card", href: "/customer/offers", icon: Award },
    { name: "Book Service", href: "/customer/appointments", icon: Calendar },
    { name: "Vehicle History", href: "/customer/vehicles", icon: Car },
    { name: "Warranty Center", href: "/customer/warranty", icon: ShieldCheck },
    { name: "Invoice History", href: "/customer/invoices", icon: FileText },
    { name: "Alerts Center", href: "/customer/notifications", icon: Bell, badgeCount: 2 }
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-[#f4f4f7] flex relative font-sans overflow-x-hidden">
      {/* Dynamic Ambient Blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden w-full h-16 sticky top-0 bg-[#0c0c14]/90 backdrop-blur border-b border-white/5 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-amber-500 font-mono">T</span>
          </div>
          <span className="text-xs font-bold tracking-widest text-white">CUSTOMER HUB</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/80 hover:text-amber-500 transition"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* DESKTOP SIDEBAR - Glassmorphism, Expandable on Hover */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`hidden md:flex flex-col justify-between h-screen sticky top-0 glass-panel border-r border-white/5 py-6 z-30 transition-all duration-300 ${
          isSidebarHovered ? "w-64 px-4" : "w-16 px-2"
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo representation */}
          <div className={`flex items-center ${isSidebarHovered ? "gap-3 px-2" : "justify-center"}`}>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-amber-500 animate-spin-slow" />
            </div>
            {isSidebarHovered && (
              <div>
                <span className="font-bold text-xs tracking-widest text-white block">TAJ TYRE WORK</span>
                <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest block -mt-0.5">Customer Client</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-xl p-3 text-xs font-semibold transition group relative ${
                    isActive
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  } ${isSidebarHovered ? "gap-3" : "justify-center"}`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-amber-500/80 group-hover:text-amber-500 transition"}`} />
                  
                  {isSidebarHovered && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {/* Icon badge */}
                  {item.badgeCount && (
                    <span className={`absolute ${isSidebarHovered ? "right-3" : "top-2 right-2"} text-[8px] font-bold font-mono bg-rose-500 text-white rounded-full flex items-center justify-center min-w-4 h-4 px-1`}>
                      {item.badgeCount}
                    </span>
                  )}

                  {/* Hover tooltip for collapsed state */}
                  {!isSidebarHovered && (
                    <div className="absolute left-16 bg-[#12121a] border border-white/10 py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold text-white shadow-xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition duration-300 pointer-events-none whitespace-nowrap z-40">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="flex flex-col gap-2">
          {isSidebarHovered && (
            <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5 mb-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/35 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-amber-500" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-white/50 block font-mono">SIGNED IN AS</span>
                <span className="text-xs font-bold text-white truncate block">{userName}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex items-center rounded-xl p-3 text-xs font-semibold text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 transition group relative ${
              isSidebarHovered ? "gap-3 px-4" : "justify-center"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarHovered && <span className="truncate">Logout Portal</span>}
            
            {!isSidebarHovered && (
              <div className="absolute left-16 bg-[#12121a] border border-rose-500/20 py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold text-rose-400 shadow-xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition duration-300 pointer-events-none whitespace-nowrap z-40">
                Logout Portal
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ translateX: "-100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="w-64 bg-[#0a0a0f] border-r border-white/5 h-full p-6 flex flex-col justify-between z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-sm tracking-widest text-white">TAJ HUB</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-white/60">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl p-3 text-xs font-semibold transition ${
                          isActive
                            ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-amber-500/80"}`} />
                        <span>{item.name}</span>
                        {item.badgeCount && (
                          <span className="ml-auto text-[8px] font-bold font-mono bg-rose-500 text-white rounded-full flex items-center justify-center w-4 h-4">
                            {item.badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <User className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] text-white/40 block font-mono">CLIENT</span>
                    <span className="text-xs font-bold text-white block truncate">{userName}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-rose-500/20 text-rose-400 font-semibold text-xs tracking-wider transition hover:bg-rose-500/5 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Portal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10 w-full">
        {/* Top bar for user profile greeting (hidden on mobile since we have drawer) */}
        <header className="hidden md:flex h-16 border-b border-white/5 items-center justify-between px-8 bg-[#07070c]/50">
          <div>
            <h1 className="text-xs font-mono text-white/40 uppercase">CUSTOMER CONSOLE</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-white/80">
              Welcome, <span className="text-amber-500 font-bold">{userName}</span>
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/35 flex items-center justify-center text-[10px] font-bold text-amber-500 font-mono">
              {userName[0]}
            </div>
          </div>
        </header>

        {/* Dashboard Pages Injection */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
