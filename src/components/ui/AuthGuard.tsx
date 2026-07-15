"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { authService } from "@/lib/auth";
import { dbStore } from "@/lib/store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      const guard = authService.validateRouteAccess(pathname);
      if (!guard.allowed && guard.redirectUrl) {
        router.push(guard.redirectUrl);
      } else {
        setAuthorized(true);
        dbStore.syncWithServer().catch(err => {
          console.error("AuthGuard server sync failed:", err);
        });
      }
    };

    checkAccess();
    
    // Listen for storage changes (e.g. log out on another tab)
    const handleStorageChange = () => {
      checkAccess();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#050507] text-[#f4f4f7] flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <Compass className="w-10 h-10 text-amber-500 animate-spin-slow mx-auto" />
          <p className="text-xs text-white/50 font-mono tracking-widest uppercase">
            Verifying node credentials...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
