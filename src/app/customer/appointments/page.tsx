"use client";

import React, { useState, useEffect } from "react";
import { Clock, CalendarDays, CheckCircle2, RefreshCw, Sparkles, Send } from "lucide-react";
import { dbStore, Appointment } from "@/lib/store";

export default function CustomerAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentUserPhone, setCurrentUserPhone] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");

  // Form Fields
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [serviceType, setServiceType] = useState<"Fitting" | "Alignment" | "Balancing" | "Nitrogen">("Fitting");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 11:00 AM");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadAppointments = () => {
    const phone = localStorage.getItem("ttw_currentUserPhone") || "9199936181";
    const name = localStorage.getItem("ttw_currentUserName") || "Mohammad Samar";
    setCurrentUserPhone(phone);
    setCurrentUserName(name);

    // Get all appointments matching user phone
    const list = dbStore.getAppointments();
    const userApts = list.filter((a) => a.customerPhone === phone);
    setAppointments(userApts);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    setTimeout(() => {
      setIsSubmitting(false);

      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        customerName: currentUserName,
        customerPhone: currentUserPhone,
        vehicleNumber: vehicleNumber.toUpperCase(),
        serviceType: serviceType,
        date: date,
        timeSlot: timeSlot,
        status: "Pending"
      };

      dbStore.addAppointment(newApt);
      setSuccessMsg("Appointment booked successfully! Manager Samar has been notified.");
      setVehicleNumber("");
      
      // Reload list
      loadAppointments();

      // Clear success message after 4s
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 800);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "In Progress":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "Cancelled":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      default:
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          GARAGE SERVICE SCHEDULER
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Book Service Appointment
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Booking Form (LHS: 5 cols) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
            {/* Ambient indicator */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-6">
              New Service Details
            </h3>

            <form onSubmit={handleBook} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/50">Vehicle Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL3C-AM-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-xs text-white outline-none transition uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/50">Service Operation</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-xs text-white outline-none transition"
                >
                  <option value="Fitting">Tyre Fitting</option>
                  <option value="Alignment">Computerized Wheel Alignment</option>
                  <option value="Balancing">Precision Wheel Balancing</option>
                  <option value="Nitrogen">Nitrogen Gas Inflation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/50">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-xs text-white outline-none transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/50">Select Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-xs text-white outline-none transition"
                  >
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-start leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Book Schedule
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bookings List (RHS: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-500" />
              Your Booked Slots
            </h3>
            <button 
              onClick={loadAppointments}
              className="text-xs text-white/50 hover:text-amber-500 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-5 bg-cyber-gray border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden group">
                {/* Visual side indicator bar */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                  apt.status === "Completed" ? "bg-emerald-500" : apt.status === "In Progress" ? "bg-blue-500" : apt.status === "Cancelled" ? "bg-rose-500" : "bg-amber-500"
                }`}></div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white font-mono uppercase">
                      {apt.serviceType} fitment
                    </span>
                    <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded border ${getStatusStyle(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/50 space-y-0.5">
                    <p>Vehicle: <span className="text-white font-mono">{apt.vehicleNumber}</span></p>
                    <p>Schedule: <span className="text-white font-mono">{apt.date} at {apt.timeSlot}</span></p>
                    {apt.mechanicName && (
                      <p>Assigned staff: <span className="text-amber-500 font-semibold">{apt.mechanicName}</span></p>
                    )}
                  </div>
                </div>

                <div className="sm:text-right text-xs">
                  {apt.status === "Completed" ? (
                    <div className="text-[10px] text-white/40 leading-relaxed font-mono">
                      <span className="text-emerald-400 font-bold block">✓ Done in {apt.timeTaken || 20}m</span>
                      <span>Alignment sheet generated</span>
                    </div>
                  ) : apt.status === "In Progress" ? (
                    <span className="text-[10px] text-blue-400 font-mono animate-pulse block font-bold">
                      ⚡ ACTIVE IN BAY
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/30 font-mono">
                      Queue position queued
                    </span>
                  )}
                </div>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs">
                No scheduled service bookings found under your number. Use the form on the left to schedule.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
