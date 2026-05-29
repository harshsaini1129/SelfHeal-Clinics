import { useState, useEffect, FormEvent } from 'react';
import { Stethoscope, Calendar, Clock, CreditCard, CheckCircle2, User, Phone, Mail, FileText, ChevronRight, RefreshCw, CalendarDays, ArrowRight } from 'lucide-react';
import { DEPARTMENTS, DOCTORS } from '../data';
import { Appointment, Doctor } from '../types';
import { motion } from 'motion/react';
import { useAuth } from './FirebaseProvider';
import AuthView from './AuthView';

interface BookingFormProps {
  preFilledArg?: string | null;
  onBookingSuccess: () => void;
}

export default function BookingForm({ preFilledArg, onBookingSuccess }: BookingFormProps) {
  const { user, userProfile, addAppointment } = useAuth();

  // Parsing inputs
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // Patient details
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [reason, setReason] = useState('');

  // Auto-complete patient fields when details are loaded from Firestore
  useEffect(() => {
    if (userProfile) {
      setPatientName(userProfile.fullName || '');
      setPatientEmail(userProfile.email || '');
      if (userProfile.phone) {
        setPhoneCached(userProfile.phone);
      }
    } else if (user) {
      setPatientName(user.displayName || '');
      setPatientEmail(user.email || '');
    }
  }, [user, userProfile]);

  // Helper workaround for setting patientPhone safely on load
  const setPhoneCached = (num: string) => {
    setPatientPhone(num);
  };

  // UI Flow triggers
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Appointment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Restrict past dates in calendar
  const todayString = new Date().toISOString().split('T')[0];

  // Auto pre-populate selected routes
  useEffect(() => {
    if (preFilledArg) {
      if (preFilledArg.startsWith('doc:')) {
        const docId = preFilledArg.substring(4);
        const resolvedDoc = DOCTORS.find(d => d.id === docId);
        if (resolvedDoc) {
          setSelectedDeptId(resolvedDoc.departmentId);
          setSelectedDoctorId(docId);
        }
      } else if (preFilledArg.startsWith('dept:')) {
        const deptId = preFilledArg.substring(5);
        if (DEPARTMENTS.some(d => d.id === deptId)) {
          setSelectedDeptId(deptId);
          setSelectedDoctorId(''); // Reset doctor since they just picked department
        }
      }
    } else {
      // No filling, set to first department by default
      setSelectedDeptId(DEPARTMENTS[0].id);
      setSelectedDoctorId('');
    }
  }, [preFilledArg]);

  // When selected department changes, filter doctor choices
  useEffect(() => {
    if (selectedDeptId) {
      const docsInDept = DOCTORS.filter(d => d.departmentId === selectedDeptId);
      if (docsInDept.length > 0) {
        // If the current slot doctor is not in this department, reset doctor
        const activeDoctor = docsInDept.find(d => d.id === selectedDoctorId);
        if (!activeDoctor) {
          setSelectedDoctorId(docsInDept[0].id);
        }
      } else {
        setSelectedDoctorId('');
      }
    }
  }, [selectedDeptId]);

  // When doctor changes, reset time slot selection
  useEffect(() => {
    setSelectedSlot('');
  }, [selectedDoctorId, selectedDate]);

  const activeDoctors = DOCTORS.filter(d => d.departmentId === selectedDeptId);
  const activeDocDetail = DOCTORS.find(d => d.id === selectedDoctorId);

  const handleBooking = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Field audits
    if (!selectedDeptId) {
      setErrorMessage('Please select a clinical department.');
      return;
    }
    if (!selectedDoctorId) {
      setErrorMessage('Please choose a specialized medical representative.');
      return;
    }
    if (!selectedDate) {
      setErrorMessage('Please specify an appointment date.');
      return;
    }
    if (!selectedSlot) {
      setErrorMessage('Please select a preferred consulting time slot.');
      return;
    }
    if (!patientName.trim()) {
      setErrorMessage('Please input a valid patient first and last name.');
      return;
    }
    if (!patientEmail.includes('@')) {
      setErrorMessage('Please supply a valid contact email address.');
      return;
    }
    if (patientPhone.trim().length < 6) {
      setErrorMessage('Please input a complete contact phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticket = await addAppointment({
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        patientPhone: patientPhone.trim(),
        doctorId: selectedDoctorId,
        departmentId: selectedDeptId,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason: reason.trim() || 'General Consulting Diagnostic',
      });
      setCreatedTicket(ticket);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to submit clinical booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDoctorName = (id: string) => {
    return DOCTORS.find(d => d.id === id)?.name || 'Direct Associate';
  };

  const getDeptName = (id: string) => {
    return DEPARTMENTS.find(d => d.id === id)?.name || id;
  };

  // Auth Gate: Check if user is logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto space-y-6 py-12 animate-fade-in flex flex-col justify-center min-h-[40vh]">
        <div className="text-center space-y-2 mb-2">
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal">Secure Outpatient Registration</h2>
          <p className="text-xs text-brand-clay font-medium">Please sign in or register to book a medical appointment slot.</p>
        </div>
        <AuthView />
      </div>
    );
  }

  // Printable receipt view
  if (createdTicket) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="max-w-xl mx-auto space-y-6 py-6"
      >
        <div className="bg-white border-2 border-brand-olive rounded-3xl overflow-hidden shadow-lg relative">
          {/* Wave cut design for receipt */}
          <div className="bg-brand-olive text-white p-6 text-center space-y-2">
            <div className="w-12 h-12 bg-white text-brand-olive rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-brand-olive" />
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight">Clinical Admission Pass</h2>
            <p className="text-xs font-semibold text-brand-stone/95 font-sans">SelfHeal Outpatient Admissions Department</p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center bg-brand-stone border border-brand-olivelight/40 p-4 rounded-xl">
              <div>
                <span className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">Admission Code</span>
                <span className="font-mono text-lg font-bold text-brand-charcoal">{createdTicket.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">Outpatient Status</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  (createdTicket.status === 'Pending' || createdTicket.status === 'pending')
                    ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    : 'bg-brand-olivesoft text-brand-olive border-brand-olivelight/30'
                }`}>
                  {createdTicket.status}
                </span>
              </div>
            </div>

            {/* Clinical Segment */}
            <div className="space-y-4 text-sm">
              <h3 className="font-serif font-bold text-brand-charcoal border-b border-brand-olivesoft pb-1.5 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-brand-olive" />
                Clinical Routing Info
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-brand-clay font-medium block">Assigned Specialist</span>
                  <span className="font-bold text-brand-charcoal">{getDoctorName(createdTicket.doctorId)}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-clay font-medium block">Department Wing</span>
                  <span className="font-bold text-brand-charcoal">{getDeptName(createdTicket.departmentId)}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-clay font-medium block">Scheduled Date</span>
                  <span className="font-bold text-brand-charcoal">{createdTicket.date}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-clay font-medium block">Time Slot</span>
                  <span className="font-bold text-brand-charcoal font-mono text-xs">{createdTicket.timeSlot}</span>
                </div>
              </div>
            </div>

            {/* Patient Segment */}
            <div className="space-y-4 text-sm">
              <h3 className="font-serif font-bold text-brand-charcoal border-b border-brand-olivesoft pb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-olive" />
                Registered Patient Details
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-brand-clay">Full Name:</span>
                  <span className="font-semibold text-brand-charcoal">{createdTicket.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-brand-clay">Email:</span>
                  <span className="font-semibold text-brand-charcoal">{createdTicket.patientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-brand-clay">Phone Hotline:</span>
                  <span className="font-semibold text-brand-charcoal font-mono">{createdTicket.patientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-brand-clay">Clinical Reason:</span>
                  <span className="font-semibold text-brand-clay truncate max-w-[200px]">{createdTicket.reason}</span>
                </div>
              </div>
            </div>

            {/* Admissions note */}
            <div className="p-4 bg-brand-stone rounded-xl border border-brand-olivelight/50 text-[11px] text-brand-clay leading-normal">
              <p className="font-bold text-brand-charcoal uppercase tracking-wide block mb-1">🏥 Outpatient Admissions Note</p>
              Please present this Admission Pass or mention ID <span className="font-bold text-brand-charcoal font-mono">{createdTicket.id}</span> at the main lobby desk of SelfHeal Hospitals 10 minutes prior to your time. Face mask is recommended in patient wards.
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onBookingSuccess()}
            className="px-6 py-2.5 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white font-bold rounded-xl text-xs tracking-wider transition-colors cursor-pointer"
          >
            Go to My Bookings
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCreatedTicket(null)}
            className="px-6 py-2.5 border border-brand-olivelight hover:bg-brand-stone-dark text-brand-charcoal font-semibold rounded-xl text-xs transition-colors cursor-pointer bg-white"
          >
            Book Another Slot
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white border border-brand-olivelight rounded-3xl overflow-hidden shadow-sm"
    >
      <div className="bg-brand-charcoal text-white p-8 relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-2xl font-serif font-bold tracking-tight">Admissions Booking Portal</h2>
        <p className="text-brand-stone/80 text-xs mt-1 leading-relaxed">
          Please complete your clinical routing. Only certified consulting physicians will accept bookings within this queue system.
        </p>
      </div>

      <form onSubmit={handleBooking} className="p-6 sm:p-8 space-y-6">
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: Department & Doctor selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand-clay uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-brand-olive text-white text-[10px] flex items-center justify-center font-bold font-serif">1</span>
            Clinical Routing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-charcoal block">Required Department</label>
              <div className="relative">
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-white border border-brand-olivelight rounded-xl py-2.5 px-3 text-sm focus:border-brand-olive outline-none text-brand-charcoal font-semibold"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-charcoal block font-sans">Available Specialist</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full bg-white border border-brand-olivelight rounded-xl py-2.5 px-3 text-sm focus:border-brand-olive outline-none text-brand-charcoal font-semibold"
              >
                {activeDoctors.length === 0 ? (
                  <option value="">No specialists found</option>
                ) : (
                  activeDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} (Fee: ${doc.consultingFee})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Quick Doctor Profile Card */}
          {activeDocDetail && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-brand-stone rounded-xl border border-brand-olivelight/40 flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-olive text-white flex items-center justify-center font-extrabold text-sm shrink-0 font-serif">
                ★
              </div>
              <div>
                <span className="text-[10px] text-brand-clay font-bold block">{activeDocDetail.role}</span>
                <p className="text-xs text-brand-charcoal font-semibold leading-relaxed">
                  Rating: <span className="text-brand-olive font-bold">★ {activeDocDetail.rating} ({activeDocDetail.reviewCount} patients)</span> | Fee: ${activeDocDetail.consultingFee}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* STEP 2: Clinical schedule */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand-clay uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-brand-olive text-white text-[10px] flex items-center justify-center font-bold font-serif">2</span>
            Schedule Appointment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Calendar Date Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-charcoal block flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-brand-clay" />
                Select Date
              </label>
              <input
                type="date"
                min={todayString}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-brand-olivelight rounded-xl py-2.5 px-3 text-sm focus:border-brand-olive outline-none text-brand-charcoal font-semibold"
              />
            </div>

            {/* Doctor Active Days Info badge */}
            {activeDocDetail && (
              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="p-3 bg-brand-stone border border-brand-olivelight/55 rounded-xl text-left">
                  <span className="text-[10px] text-brand-clay font-bold block">Doctor Working Days:</span>
                  <span className="text-xs text-brand-charcoal font-semibold">{activeDocDetail.availability.days.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Time Slot Selection */}
          {activeDocDetail && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-charcoal block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-clay" />
                Pick Clock Slot
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {activeDocDetail.availability.slots.map((slot) => {
                  const isActive = selectedSlot === slot;
                  return (
                    <motion.button
                      key={slot}
                      type="button"
                      id={`slot-btn-${slot.replace(' ', '-')}`}
                      onClick={() => setSelectedSlot(slot)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`py-2 text-center text-xs font-semibold rounded-lg border transition-all cursor-pointer font-mono ${
                        isActive
                          ? 'bg-brand-olive border-brand-olive text-white font-bold ring-2 ring-brand-olivelight/30 scale-102 font-serif'
                          : 'bg-white hover:bg-brand-stone border-brand-olivelight/60 text-brand-charcoal'
                      }`}
                    >
                      {slot}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: Patient particulars */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand-clay uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-brand-olive text-white text-[10px] flex items-center justify-center font-bold font-serif">3</span>
            Patient Contact Particulars
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-charcoal block flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand-clay" />
                  Full Patient Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Liam Henderson"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-white border border-brand-olivelight rounded-xl py-2.5 px-3 text-sm focus:border-brand-olive outline-none text-brand-charcoal font-semibold"
                />
              </div>

              {/* Patient Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-charcoal block flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand-clay" />
                  Patient Telephone Hotline
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 0192"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full bg-white border border-brand-olivelight rounded-xl py-2.5 px-3 text-sm focus:border-brand-olive outline-none text-brand-charcoal font-semibold"
                />
              </div>
            </div>

            {/* Patient Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-charcoal block flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-brand-clay" />
                Official Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. patient@care.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="w-full bg-white border border-brand-olivelight rounded-xl py-2.5 px-3 text-sm focus:border-brand-olive outline-none text-brand-charcoal font-semibold"
              />
            </div>

            {/* Visit Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-charcoal block flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-brand-clay" />
                Reason for Outpatient Visit (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Briefly summarize primary symptoms or request e.g. general vascular screening, chronic headache follow up, child booster dose..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white border border-brand-olivelight rounded-xl py-2.5 px-3 text-sm focus:border-brand-olive outline-none text-brand-charcoal font-semibold resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-brand-olivesoft flex items-center justify-between gap-4">
          <p className="text-[11px] text-brand-clay max-w-sm">
            By booking, you reserve an active slot in SelfHeal’s physical clinic. If your plans change, please reschedule via 'My Bookings'.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 bg-brand-olive hover:bg-brand-olivedark disabled:bg-brand-stone text-white font-bold rounded-xl text-sm transition-all shadow-md inline-flex items-center gap-2 shrink-0 justify-center min-w-[140px] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Confirm Booking
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
