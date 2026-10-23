"use client";

import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ClipboardList, 
  Upload, 
  Send,
  RefreshCw,
  Search,
  BookOpen,
  X
} from "lucide-react";
import { dbStore, Appointment, Customer, JobCard } from "@/lib/store";

export default function EmployeePage() {
  const [employeeType, setEmployeeType] = useState("Mechanic");
  const [employeeName, setEmployeeName] = useState("Staff");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Receptionist Form Fields
  const [clientPhone, setClientPhone] = useState("");
  const [clientName, setClientName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [mileage, setMileage] = useState("");
  const [serviceType, setServiceType] = useState<"Fitting" | "Alignment" | "Balancing" | "Nitrogen">("Fitting");
  const [allocatedMechanic, setAllocatedMechanic] = useState("Karan Singh");
  
  // Mechanic Completion Form Overlay State
  const [completingApt, setCompletingApt] = useState<Appointment | null>(null);
  const [timeTaken, setTimeTaken] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Form notifications
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clock Attendance
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState("");

  const loadData = () => {
    const type = localStorage.getItem("ttw_employeeType") || "Mechanic";
    const name = localStorage.getItem("ttw_currentUserName") || "Staff";
    setEmployeeType(type);
    setEmployeeName(name);

    setAppointments(dbStore.getAppointments());
    setCustomers(dbStore.getCustomers());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Customer phone lookup auto-fills customer name
  useEffect(() => {
    if (clientPhone.length >= 10) {
      const match = customers.find((c) => c.phone === clientPhone);
      if (match) {
        setClientName(match.name);
      }
    }
  }, [clientPhone, customers]);

  // Receptionist check-in submission
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceType === "Alignment" || serviceType === "Balancing") {
      alert("Wheel Alignment and Wheel Balancing are currently Coming Soon. Please select Tyre Fitting or Nitrogen top-up.");
      return;
    }
    setIsSubmitting(true);
    setSuccessMsg("");

    setTimeout(() => {
      setIsSubmitting(false);

      // Create new customer if not exists
      let client = customers.find((c) => c.phone === clientPhone);
      if (!client) {
        client = {
          id: `c-${Date.now()}`,
          name: clientName,
          phone: clientPhone,
          visits: 1,
          purchasesCount: 0,
          totalSpent: 0,
          trustLevel: "Bronze",
          savings: 0,
          vehicles: [
            { id: `v-${Date.now()}`, model: "Checked In Vehicle", plateNumber: plateNumber.toUpperCase(), tyreInstalled: "N/A", installDate: new Date().toISOString().split("T")[0], mileage: Number(mileage) || 0, warrantyExpiry: "N/A", nextReplacement: "N/A" }
          ],
          notes: "Self checked-in by reception.",
          rewardPoints: 50,
          outstandingAmount: 0,
          favoriteBrand: "N/A",
          averageBill: 0
        };
        const currentCustomers = dbStore.getCustomers();
        currentCustomers.push(client);
        dbStore.saveCustomers(currentCustomers);
      } else {
        // Increment visits directly since checked-in
        dbStore.incrementCustomerVisit(client.id);
      }

      // Create appointment
      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        customerName: clientName,
        customerPhone: clientPhone,
        vehicleNumber: plateNumber.toUpperCase(),
        serviceType: serviceType,
        date: new Date().toISOString().split("T")[0],
        timeSlot: "Walk-in Queue",
        status: "Pending",
        mechanicName: allocatedMechanic
      };

      dbStore.addAppointment(newApt);

      // Create Job Card
      let assignedBay: any = "Bay 2 (Fitting)";
      if (serviceType === "Nitrogen") assignedBay = "Bay 4 (Nitrogen)";

      const jobNo = `TTW-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const newJobCard: JobCard = {
        id: `job-${Date.now()}`,
        jobId: jobNo,
        customerId: client.id,
        customerName: clientName,
        customerPhone: clientPhone,
        vehicleModel: "Checked In Vehicle",
        vehicleNumber: plateNumber.toUpperCase(),
        services: [serviceType],
        mechanic: allocatedMechanic,
        bay: assignedBay,
        status: "Waiting",
        estimatedFinish: "5:20 PM",
        odometerReading: Number(mileage) || 0,
        timeline: [
          { step: "Vehicle Arrived", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true },
          { step: "Inspection", timestamp: "", completed: false },
          { step: "Tyre Installed", timestamp: "", completed: false },
          { step: "Alignment", timestamp: "", completed: false },
          { step: "Quality Check", timestamp: "", completed: false },
          { step: "Payment", timestamp: "", completed: false },
          { step: "Delivered", timestamp: "", completed: false }
        ]
      };
      dbStore.addJobCard(newJobCard);

      setSuccessMsg(`Vehicle ${plateNumber.toUpperCase()} successfully checked-in! Assigned to ${allocatedMechanic} at ${assignedBay}.`);
      
      // Reset form
      setClientPhone("");
      setClientName("");
      setPlateNumber("");
      setMileage("");
      loadData();

      setTimeout(() => setSuccessMsg(""), 4000);
    }, 800);
  };

  // Mechanic Job Updates
  const handleStartJob = (aptId: string) => {
    const list = dbStore.getAppointments();
    const found = list.find((a) => a.id === aptId);
    if (found) {
      found.status = "In Progress";
      dbStore.saveAppointments(list);

      // Update corresponding job card
      const jobs = dbStore.getJobCards();
      const job = jobs.find((j) => j.vehicleNumber === found.vehicleNumber && j.status !== "Completed");
      if (job) {
        job.status = "In Progress";
        // Mark Inspection completed
        job.timeline[1].completed = true;
        job.timeline[1].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        dbStore.saveJobCards(jobs);
      }

      loadData();
    }
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingApt) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const list = dbStore.getAppointments();
      const found = list.find((a) => a.id === completingApt.id);
      if (found) {
        found.status = "Completed";
        found.timeTaken = Number(timeTaken) || 20;
        found.beforePhoto = beforeFile ? beforeFile.name : "before_fitting.jpg";
        found.afterPhoto = afterFile ? afterFile.name : "after_fitting.jpg";
        dbStore.saveAppointments(list);

        // Update corresponding Job Card
        const jobs = dbStore.getJobCards();
        const job = jobs.find((j) => j.vehicleNumber === found.vehicleNumber && j.status !== "Completed");
        if (job) {
          job.status = "Completed";
          job.beforePhoto = beforeFile ? beforeFile.name : "before_fitting.jpg";
          job.afterPhoto = afterFile ? afterFile.name : "after_fitting.jpg";
          
          // Complete remaining timeline steps (up to quality check)
          job.timeline.forEach((step, idx) => {
            if (idx <= 4) {
              step.completed = true;
              if (!step.timestamp) {
                step.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            }
          });
          dbStore.saveJobCards(jobs);
        }
        
        // Auto alert owner that job is complete for billing
        dbStore.addNotification({
          id: `notif-${Date.now()}`,
          role: "Owner",
          title: "Service Job Completed",
          message: `${found.customerName} - ${found.serviceType} job finished by ${found.mechanicName || 'Mechanic'}. Invoice ready to compile.`,
          date: new Date().toISOString().split("T")[0],
          read: false
        });

        setSuccessMsg(`Job completed! Service timeline logged to customer card.`);
        setCompletingApt(null);
        setTimeTaken("");
        setBeforeFile(null);
        setAfterFile(null);
        loadData();

        setTimeout(() => setSuccessMsg(""), 4000);
      }
    }, 800);
  };

  // Clock in-out
  const handleClockToggle = () => {
    const nextState = !clockedIn;
    setClockedIn(nextState);
    if (nextState) {
      setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setClockTime("");
    }
  };

  const allocatedApts = appointments.filter(
    (a) => employeeType === "Receptionist" || a.mechanicName?.includes(employeeName.split(" ")[0]) || !a.mechanicName
  );

  return (
    <div className="space-y-8">
      {/* Greetings Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          GARAGE SERVICE TERMINAL
        </span>
        <h2 className="text-2xl font-bold text-white">
          Active Node: <span className="text-amber-500">{employeeName}</span>
        </h2>
        <p className="text-xs text-white/55 mt-1">
          Logged in as **{employeeType}**. Shift logged at G.T. Road bypass workshop outlet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LHS: Receptionist controls OR Mechanic Jobs Checklist (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {employeeType === "Receptionist" ? (
            /* RECEPTIONIST CHECK-IN VEHICLE CARD */
            <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
              <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-amber-500" />
                Check-in Incoming Vehicle
              </h3>

              <form onSubmit={handleCheckInSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/50">Client Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/50">Client Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Client Name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/50">Vehicle Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DL3C-AM-1234"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/50">Odometer Mileage (KM)</label>
                    <input
                      type="number"
                      required
                      placeholder="Odometer KM"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/50">Select Service Required</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as any)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                    >
                      <option value="Fitting">Tyre Fitting</option>
                      <option value="Alignment" disabled>Computerized Alignment (COMING SOON)</option>
                      <option value="Balancing" disabled>Wheel Balancing (COMING SOON)</option>
                      <option value="Nitrogen">Nitrogen top-up</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-white/50">Assign Mechanic</label>
                    <select
                      value={allocatedMechanic}
                      onChange={(e) => setAllocatedMechanic(e.target.value)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                    >
                      <option value="Karan Singh">Karan Singh (Mechanic)</option>
                      <option value="Amit Kumar">Amit Kumar (Assistant)</option>
                    </select>
                  </div>
                </div>

                {successMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Register & Queue Vehicle"
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* MECHANIC WORKLIST CHECKS */
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-500" />
                  My Assigned Bay Jobs
                </h3>
                <button 
                  onClick={loadData}
                  className="text-xs text-white/50 hover:text-amber-500 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reload
                </button>
              </div>

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-start animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                {allocatedApts.map((apt) => (
                  <div key={apt.id} className="p-5 bg-cyber-gray border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative pl-6 overflow-hidden">
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                      apt.status === "Completed" ? "bg-emerald-500" : apt.status === "In Progress" ? "bg-blue-500" : "bg-amber-500"
                    }`}></div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white font-mono uppercase">{apt.serviceType} check</span>
                        <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                          apt.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : apt.status === "In Progress" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/50 space-y-0.5 font-mono">
                        <p>Customer: <span className="text-white">{apt.customerName} ({apt.customerPhone})</span></p>
                        <p>Plate: <span className="text-white">{apt.vehicleNumber}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {apt.status === "Pending" && (
                        <button
                          onClick={() => handleStartJob(apt.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider transition"
                        >
                          Start Service
                        </button>
                      )}
                      {apt.status === "In Progress" && (
                        <button
                          onClick={() => {
                            setCompletingApt(apt);
                            setTimeTaken("");
                            setBeforeFile(null);
                            setAfterFile(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10px] uppercase tracking-wider transition"
                        >
                          Complete Job
                        </button>
                      )}
                      {apt.status === "Completed" && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          ✓ Finished ({apt.timeTaken}m)
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {allocatedApts.length === 0 && (
                  <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs">
                    No active bay service tasks found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RHS: Attendance & Working Shifts Logs (RHS: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Clock In / Out Board */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 text-center relative overflow-hidden">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase">Work Shift Attendance</h4>
            <p className="text-[10px] text-white/50 mt-1 mb-5">
              Clock your hours daily. Attendance sheets sync with billing payroll logs.
            </p>

            {clockedIn ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 text-center">
                <span className="text-[9px] text-emerald-400 font-bold block font-mono">⚡ SHIFT ACTIVE</span>
                <span className="text-lg font-mono font-bold text-white mt-1 block">Clocked In: {clockTime}</span>
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl mb-4 text-center">
                <span className="text-[9px] text-white/40 block font-mono">SHIFT OFF-LINE</span>
                <span className="text-lg font-mono font-bold text-white/30 mt-1 block">00:00:00</span>
              </div>
            )}

            <button
              onClick={handleClockToggle}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                clockedIn
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-black"
              }`}
            >
              {clockedIn ? "Clock Out of Shift" : "Clock In to Shift"}
            </button>
          </div>

          {/* Guidelines */}
          <div className="glass-panel p-5 rounded-2xl border-white/5">
            <h4 className="text-[10px] font-mono text-white/40 uppercase mb-3">Service Bay Protocols</h4>
            <ul className="space-y-2 text-[10px] text-white/60 leading-relaxed text-left list-disc pl-4">
              <li>Ensure 3D laser alignment sensor lenses are aligned before starting calibrations.</li>
              <li>Always check rim bead clean status before tyre mounting lock-clamps are locked.</li>
              <li>Ensure Nitrogren inflation runs at 98% purity calibration indices.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mechanic completion form overlay */}
      {completingApt && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#0c0c14] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-md w-full relative">
            <button
              onClick={() => setCompletingApt(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-1">
              <Wrench className="w-4 h-4" />
              Complete active Service Job
            </h3>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl font-mono text-[10px] text-white/60 space-y-0.5 mb-2">
                <p>CUSTOMER: <span className="text-white">{completingApt.customerName}</span></p>
                <p>PLATE: <span className="text-white">{completingApt.vehicleNumber}</span></p>
                <p>SERVICE: <span className="text-amber-500 font-bold uppercase">{completingApt.serviceType} fitment</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/50">Time Taken (Minutes)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25"
                  value={timeTaken}
                  onChange={(e) => setTimeTaken(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                />
              </div>

              {/* Before/After Mock Upload dropzones */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/50">Before Photo</label>
                  <label className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-amber-500/20 bg-white/5 rounded-lg p-3 text-center cursor-pointer transition select-none">
                    <Upload className="w-4 h-4 text-white/40 mb-1" />
                    <span className="text-[9px] text-white/50 truncate max-w-full">
                      {beforeFile ? beforeFile.name : "Select before"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/50">After Photo</label>
                  <label className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-amber-500/20 bg-white/5 rounded-lg p-3 text-center cursor-pointer transition select-none">
                    <Upload className="w-4 h-4 text-white/40 mb-1" />
                    <span className="text-[9px] text-white/50 truncate max-w-full">
                      {afterFile ? afterFile.name : "Select after"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold uppercase tracking-wider transition"
              >
                Log Completed Job Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
