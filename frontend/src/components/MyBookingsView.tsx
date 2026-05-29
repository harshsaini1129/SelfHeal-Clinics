import { useState, useEffect } from 'react';
import { Calendar, Clock, Stethoscope, User, XCircle, CalendarRange, Filter, CheckCircle2, ClipboardIcon, Check } from 'lucide-react';
import { DOCTORS, DEPARTMENTS } from '../data';
import { Appointment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './FirebaseProvider';
import AuthView from './AuthView';

interface MyBookingsViewProps {
  onNavigateToBook: () => void;
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 130, damping: 20 } }
};

export default function MyBookingsView({ onNavigateToBook }: MyBookingsViewProps) {
  const { user, appointments, cancelAppointment, rescheduleAppointment } = useAuth();
  const [filterMode, setFilterMode] = useState<'All' | 'Pending' | 'Confirmed' | 'Cancelled'>('All');
  
  // Rescheduling states
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');

  // Sandbox-friendly cancel confirmation state
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const todayString = new Date().toISOString().split('T')[0];

  const getDoctor = (id: string) => {
    return DOCTORS.find(d => d.id === id);
  };

  const getDeptName = (id: string) => {
    return DEPARTMENTS.find(d => d.id === id)?.name || id;
  };

  const handleCancelAppointment = async (id: string) => {
    if (cancelConfirmId !== id) {
      setCancelConfirmId(id);
      return;
    }
    
    try {
      await cancelAppointment(id);
      setCancelConfirmId(null);
    } catch (err: any) {
      console.error('Cancellation failed:', err);
    }
  };

  const initiateReschedule = (appt: Appointment) => {
    setReschedulingId(appt.id);
    setNewDate(appt.date);
    setNewSlot(appt.timeSlot);
    setRescheduleError('');
  };

  const saveReschedule = async (id: string) => {
    if (!newDate) {
      setRescheduleError('Please choose a valid scheduling date.');
      return;
    }
    if (!newSlot) {
      setRescheduleError('Please pick an admission time slot.');
      return;
    }

    try {
      await rescheduleAppointment(id, newDate, newSlot);
      setReschedulingId(null);
    } catch (err: any) {
      setRescheduleError('Failed to save rescheduled changes to database.');
    }
  };

  const filtered = appointments.filter(appt => {
    if (filterMode === 'All') return true;
    if (filterMode === 'Pending') {
      return appt.status === 'Pending' || appt.status === 'pending';
    }
    return appt.status === filterMode;
  });

  // Auth Gate: Check if patient is authenticated
  if (!user) {
    return (
      <div className="max-w-md mx-auto space-y-6 py-12 animate-fade-in flex flex-col justify-center min-h-[50vh]">
        <div className="text-center space-y-2 mb-2">
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal">Access Patient Cards</h2>
          <p className="text-xs text-brand-clay font-medium">To view or modify your outpatient passes, please log in or register.</p>
        </div>
        <AuthView />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-brand-charcoal">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-olive bg-brand-olivesoft px-3 py-1 rounded-full border border-brand-olivelight">
          Patient Card
        </span>
        <h1 className="text-3xl font-serif text-brand-charcoal tracking-tight leading-tight sm:text-4xl">
          Track Your Registered Appointments
        </h1>
        <p className="text-brand-clay max-w-xl mx-auto text-sm">
          Audit confirmed hospital passes, cancel slots, or live-reschedule consulting dates in real-time.
        </p>
      </div>

      {/* Booking Filter buttons */}
      <div className="flex items-center justify-between border-b border-brand-olivesoft pb-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-brand-stone p-1 rounded-xl border border-brand-olivelight/40">
          {(['All', 'Pending', 'Confirmed', 'Cancelled'] as const).map((mode) => {
            const isActive = filterMode === mode;
            return (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterMode(mode)}
                className={`px-4 py-2 font-bold text-[11px] sm:text-xs rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-brand-olive text-white shadow-sm'
                    : 'text-brand-clay hover:text-brand-charcoal'
                }`}
              >
                {mode} Passes
              </motion.button>
            );
          })}
        </div>

        <span className="text-xs font-mono text-brand-clay font-semibold">
          Count: {filtered.length} Pass(es)
        </span>
      </div>

      {/* Ultimate list */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-brand-stone border border-brand-olivelight/60 rounded-3xl p-12 text-center max-w-lg mx-auto"
          >
            <CalendarRange className="w-12 h-12 text-brand-clay mx-auto mb-4" />
            <h3 className="text-base font-serif font-bold text-brand-charcoal">No Admission Records Found</h3>
            <p className="text-xs text-brand-clay mt-1.5 leading-normal">
              You do not currently have any admission passes registered under this browser profile matching the "{filterMode}" filter.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNavigateToBook}
              className="mt-6 px-6 py-2.5 bg-brand-olive hover:bg-brand-olivedark text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              Create Hospital Appointment
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 max-w-2xl mx-auto"
          >
            {filtered.map((appt) => {
              const doctor = getDoctor(appt.doctorId);
              const isRescheduling = reschedulingId === appt.id;

              return (
                <motion.div
                  key={appt.id}
                  variants={cardVariants}
                  layout
                  className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative transition-all ${
                    (appt.status === 'Cancelled' || appt.status === 'cancelled' || appt.status === 'rejected' || appt.status === 'Rejected') ? 'opacity-70 border-brand-olivesoft/50' : 'border-brand-olivelight'
                  }`}
                >
                  {/* Status and ID */}
                  <div className="flex justify-between items-center border-b border-brand-olivesoft pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">Admission Pass</span>
                      <span className="font-mono text-sm font-bold text-brand-charcoal">{appt.id}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        appt.status === 'Confirmed'
                          ? 'bg-brand-olivesoft text-brand-olive border-brand-olivelight/40'
                          : (appt.status === 'Pending' || appt.status === 'pending')
                          ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  {/* Patient / doctor content info */}
                  <div className="py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Doctor Info */}
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-brand-stone border border-brand-olivelight/40 rounded-lg text-brand-olive mt-0.5">
                          <Stethoscope className="w-4 h-4 text-brand-olive" />
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-clay font-bold block uppercase tracking-wider">Clinical Physician</span>
                          <span className="text-sm font-serif font-bold text-brand-charcoal">{doctor?.name || 'Physician Specialist'}</span>
                          <span className="text-xs text-brand-clay block">{getDeptName(appt.departmentId)} Specialist</span>
                        </div>
                      </div>

                      {/* Patient Name */}
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-brand-stone border border-brand-olivelight/40 rounded-lg text-brand-olive mt-0.5">
                          <User className="w-4 h-4 text-brand-olive" />
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-clay font-bold block uppercase tracking-wider">Registered Patient</span>
                          <span className="text-sm font-bold text-brand-charcoal">{appt.patientName}</span>
                          <span className="text-xs text-brand-clay block font-semibold">Phone: {appt.patientPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rescheduling Engine Panel */}
                    <AnimatePresence>
                      {isRescheduling && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-brand-stone p-4 rounded-xl border border-brand-olivelight mt-3 space-y-3 overflow-hidden"
                        >
                          <p className="text-xs font-serif font-bold text-brand-charcoal">Direct Slot Rescheduler</p>
                          {rescheduleError && (
                            <p className="text-[10px] text-red-600 font-semibold">{rescheduleError}</p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-brand-clay font-bold uppercase block font-semibold">New Date</label>
                              <input
                                type="date"
                                min={todayString}
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="bg-white border border-brand-olivelight rounded-lg py-1 px-2.5 text-xs w-full text-brand-charcoal font-semibold outline-none"
                              />
                            </div>

                            {doctor && (
                              <div className="space-y-1">
                                <label className="text-[10px] text-brand-clay font-bold uppercase block font-semibold">Available Slot</label>
                                <select
                                  value={newSlot}
                                  onChange={(e) => setNewSlot(e.target.value)}
                                  className="bg-white border border-brand-olivelight rounded-lg py-1 px-2 text-xs w-full text-brand-charcoal font-semibold outline-none"
                                >
                                  <option value="">Select New Slot</option>
                                  {doctor.availability.slots.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setReschedulingId(null)}
                              className="bg-white text-brand-charcoal border border-brand-olivelight font-semibold text-[10px] px-3 py-1.5 rounded-lg hover:bg-brand-stone transition-colors cursor-pointer"
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => saveReschedule(appt.id)}
                              className="bg-brand-olive text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg hover:bg-brand-olivedark transition-colors shadow-sm cursor-pointer"
                            >
                              Save Changes
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isRescheduling && (
                      <div className="bg-brand-stone p-3 sm:px-4 rounded-xl border border-brand-olivelight/40 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-brand-clay" />
                          <span>Date: <span className="text-brand-charcoal font-bold font-mono">{appt.date}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-brand-clay" />
                          <span>Slot: <span className="text-brand-charcoal font-bold font-mono">{appt.timeSlot}</span></span>
                        </div>
                      </div>
                    )}

                    {appt.reason && (
                      <div className="flex items-start gap-2.5 text-xs">
                        <ClipboardIcon className="w-4 h-4 text-brand-clay mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">Reason for Clinical Visit:</span>
                          <p className="text-brand-clay font-light italic mt-0.5">"{appt.reason}"</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cancel Reschedule Actions */}
                  {!isRescheduling && (appt.status === 'Confirmed' || appt.status === 'Pending' || appt.status === 'pending') && (
                    <div className="border-t border-brand-olivesoft pt-3 flex items-center justify-end gap-2.5">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCancelAppointment(appt.id)}
                        className={`text-xs flex items-center gap-1 transition-all font-semibold cursor-pointer py-1 px-2.5 rounded-lg ${
                          cancelConfirmId === appt.id
                            ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            : 'text-brand-clay hover:text-red-700 hover:underline'
                        }`}
                      >
                        {cancelConfirmId === appt.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Confirm Cancel?
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel Slot
                          </>
                        )}
                      </motion.button>
                      <span className="text-brand-olivelight">|</span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setCancelConfirmId(null);
                          initiateReschedule(appt);
                        }}
                        className="text-xs text-brand-olive hover:text-brand-olivedark flex items-center gap-1 font-bold hover:underline transition-colors cursor-pointer"
                      >
                        Reschedule Date
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
