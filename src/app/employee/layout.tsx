"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Wrench, Compass } from "lucide-react";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState("Staff");
  const [employeeType, setEmployeeType] = useState("Mechanic");

  useEffect(() => {
    // Role validation
    const role = localStorage.getItem("ttw_currentUserRole");
    if (role !== "Employee") {
      router.push("/login");
      return;
    }
    const name = localStorage.getItem("ttw_currentUserName") || "Staff";
    const type = localStorage.getItem("ttw_employeeType") || "Mechanic";
    setEmployeeName(name);
    setEmployeeType(type);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("ttw_currentUserRole");
    localStorage.removeItem("ttw_currentUserName");
    localStorage.removeItem("ttw_employeeType");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#f4f4f7] flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <header className="h-16 sticky top-0 bg-[#0c0c14]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-amber-500 animate-spin-slow" />
          </div>
          <div>
            <span className="font-bold text-xs tracking-widest text-white block">TAJ STAFF TERMINAL</span>
            <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest block -mt-0.5">
              {employeeType} Node ({employeeName.split(" ")[0]})
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/5 transition text-xs font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Node</span>
        </button>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto relative z-10">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
