"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, Eye, ShieldAlert, Sparkles } from "lucide-react";
import { dbStore, Notification } from "@/lib/store";

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = () => {
    const list = dbStore.getNotifications();
    // Filter customer notifications
    const customerList = list.filter((n) => n.role === "Customer");
    setAppointments(customerList);
  };

  const setAppointments = (list: Notification[]) => {
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = (id: string) => {
    const list = dbStore.getNotifications();
    const found = list.find((n) => n.id === id);
    if (found) {
      found.read = true;
      dbStore.saveNotifications(list);
      loadNotifications();
    }
  };

  const handleMarkAllAsRead = () => {
    const list = dbStore.getNotifications();
    list.forEach((n) => {
      if (n.role === "Customer") n.read = true;
    });
    dbStore.saveNotifications(list);
    loadNotifications();
  };

  const getNotifIcon = (title: string) => {
    if (title.includes("Coupon") || title.includes("Discount") || title.includes("Offer")) {
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    } else if (title.includes("Expiry") || title.includes("Warning")) {
      return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    } else {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
            CLIENT NOTIFICATION DESK
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Alerts & Messages
          </h2>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-amber-500 hover:underline font-semibold"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div 
            key={n.id}
            className={`p-5 rounded-2xl border flex items-start gap-4 transition relative overflow-hidden ${
              n.read
                ? "bg-cyber-gray border-white/5 opacity-60"
                : "glass-panel-amber border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.03)]"
            }`}
          >
            {/* Visual side indicator for unread */}
            {!n.read && (
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500"></div>
            )}

            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl shrink-0">
              {getNotifIcon(n.title)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-white leading-snug">{n.title}</h4>
                {!n.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                )}
              </div>
              <p className="text-xs text-white/55 leading-relaxed">{n.message}</p>
              <span className="text-[9px] font-mono text-white/40 block mt-2">{n.date}</span>
            </div>

            {!n.read && (
              <button
                onClick={() => handleMarkAsRead(n.id)}
                className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-500 hover:text-amber-600 transition"
              >
                Mark Read
              </button>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs flex flex-col items-center justify-center gap-2">
            <Bell className="w-8 h-8 opacity-45 mb-1 text-amber-500" />
            <span>You have no notifications in your inbox.</span>
          </div>
        )}
      </div>
    </div>
  );
}
