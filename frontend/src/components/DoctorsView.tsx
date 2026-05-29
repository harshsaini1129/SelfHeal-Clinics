import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, DollarSign, Languages, GraduationCap, Star, ClipboardCheck, ArrowLeft, HeartPulse, User } from 'lucide-react';
import { DOCTORS, DEPARTMENTS } from '../data';
import { Doctor } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DoctorsViewProps {
  initialSelectedDoctorId?: string | null;
  onNavigate: (tab: string, arg?: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 20 } }
};

export default function DoctorsView({ initialSelectedDoctorId, onNavigate }: DoctorsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [focusedDoc, setFocusedDoc] = useState<Doctor | null>(null);

  // If redirected with a specific doctor, auto-focus them
  useEffect(() => {
    if (initialSelectedDoctorId) {
      const doc = DOCTORS.find(d => d.id === initialSelectedDoctorId);
      if (doc) {
        setFocusedDoc(doc);
      }
    }
  }, [initialSelectedDoctorId]);

  // Clean data lists
  const departments = DEPARTMENTS;
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Filtered list
  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptId === 'all' || doc.departmentId === selectedDeptId;
    const matchesDay = selectedDay === 'all' || doc.availability.days.includes(selectedDay);

    return matchesSearch && matchesDept && matchesDay;
  });

  const getDeptName = (id: string) => {
    return departments.find(d => d.id === id)?.name || id;
  };

  const selectDoctorAndBook = (doctorId: string) => {
    onNavigate('book', `doc:${doctorId}`);
  };

  if (focusedDoc) {
    // Detail view of single doctor
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Back control */}
        <button
          onClick={() => {
            setFocusedDoc(null);
            // If they had an initial doctor ID prop, let's reset it so we can navigate back properly
            onNavigate('doctors');
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-clay hover:text-brand-charcoal transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Doctors Catalog
        </button>

        {/* Big Detail Card */}
        <motion.div 
          initial={{ scale: 0.97 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-white border border-brand-olivelight rounded-2xl overflow-hidden shadow-sm max-w-4xl mx-auto"
        >
          {/* Header ribbon colored by specialty */}
          <div className="bg-gradient-to-br from-brand-olive to-brand-olivedark text-white p-8 sm:p-10 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
              <div className={`w-20 h-20 rounded-2xl ${focusedDoc.image} bg-brand-stone text-brand-charcoal flex items-center justify-center text-3xl font-extrabold shadow-inner shrink-0`}>
                <User className="w-10 h-10 text-brand-olive" />
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest bg-white/15 text-brand-stone px-3 py-1 rounded-full border border-white/20">
                  {getDeptName(focusedDoc.departmentId)} Unit
                </span>
                <h1 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl">{focusedDoc.name}</h1>
                <p className="text-brand-stone/90 text-sm">{focusedDoc.role} • {focusedDoc.experienceYears} Years Clinical Experience</p>
              </div>
            </div>
          </div>

          {/* Grid of details */}
          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Left and mid components info */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-serif font-bold text-brand-charcoal border-b border-brand-olivesoft pb-2">Medical Bio</h3>
                <p className="text-brand-clay text-sm leading-relaxed font-sans">
                  {focusedDoc.bio}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-serif font-bold text-brand-charcoal border-b border-brand-olivesoft pb-2">Focus & Training</h3>
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-brand-olive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal">{focusedDoc.education}</p>
                    <span className="text-xs text-brand-clay">Board-Certified Outpatient Specialist</span>
                  </div>
                </div>
              </div>

              {/* Consultation specifics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-stone border border-brand-olivelight/60 p-4 rounded-xl space-y-1">
                  <span className="text-xs text-brand-clay font-bold uppercase tracking-wider block">Languages Spoken</span>
                  <div className="flex items-center gap-1.5 text-brand-charcoal font-semibold text-sm mt-0.5">
                    <Languages className="w-4 h-4 text-brand-clay" />
                    {focusedDoc.languages.join(', ')}
                  </div>
                </div>

                <div className="bg-brand-stone border border-brand-olivelight/60 p-4 rounded-xl space-y-1">
                  <span className="text-xs text-brand-clay font-bold uppercase tracking-wider block">Outpatient Consultation Fee</span>
                  <div className="flex items-center gap-1 text-brand-charcoal font-bold text-sm mt-0.5">
                    <DollarSign className="w-4 h-4 text-brand-olive" />
                    ${focusedDoc.consultingFee} USD
                  </div>
                </div>
              </div>
            </div>

            {/* Right: schedule booking card */}
            <div className="bg-brand-stone p-6 rounded-2xl border border-brand-olivelight flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-brand-charcoal text-sm uppercase tracking-wider">Weekly Schedule</h4>
                  <span className="text-brand-olive bg-brand-olivesoft border border-brand-olivelight/40 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                    ★ {focusedDoc.rating}
                  </span>
                </div>

                {/* Days */}
                <div className="space-y-1.5">
                  <span className="text-xs text-brand-clay font-medium block">Working Days:</span>
                  <div className="flex flex-wrap gap-1">
                    {focusedDoc.availability.days.map((day, dIdx) => (
                      <span key={dIdx} className="text-xs bg-white text-brand-charcoal border border-brand-olivelight/60 px-2.5 py-1 rounded-md font-semibold font-mono">
                        {day.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Slots */}
                <div className="space-y-1.5">
                  <span className="text-xs text-brand-clay font-medium block">Consultation Slots:</span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {focusedDoc.availability.slots.map((slot, sIdx) => (
                      <span key={sIdx} className="text-[11px] bg-white text-brand-charcoal hover:text-brand-olive hover:bg-brand-olivesoft text-center py-1 rounded border border-brand-olivelight/30 transition-colors font-semibold font-mono">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-olivelight/60 mt-6 space-y-2">
                <motion.button
                  onClick={() => selectDoctorAndBook(focusedDoc.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 bg-brand-olive hover:bg-brand-olivedark text-white font-bold rounded-xl transition-colors shadow-sm text-sm cursor-pointer"
                >
                  Book Appointment Now
                </motion.button>
                <p className="text-[11px] text-center text-brand-clay leading-normal">Guaranteed slot timing. Cancellation is free up to 2 hours before counseling.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters Header */}
      <div className="space-y-4">
        <div className="text-center space-y-3 block">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-olive bg-brand-olivesoft px-3 py-1 rounded-full border border-brand-olivelight text-brand-olive">
            Medical Faculty
          </span>
          <h1 className="text-3xl font-serif text-brand-charcoal tracking-tight sm:text-4xl">
            Meet Our Specialised Outpatient Physicians
          </h1>
          <p className="text-brand-clay max-w-xl mx-auto text-sm">
            Search our Board-Certified medical staff, read patient satisfaction ratings, and book guaranteed consulting sessions instantly.
          </p>
        </div>

        {/* Search bar block */}
        <div className="bg-brand-stone border border-brand-olivelight/55 rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Text Input */}
          <div className="md:col-span-4 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-brand-clay" />
            </span>
            <input
              type="text"
              placeholder="Search physicians by name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-white text-brand-charcoal placeholder-brand-clay/60 border border-brand-olivelight/80 focus:border-brand-olive rounded-xl outline-none transition-colors text-sm font-semibold animate-none"
            />
          </div>

          {/* Dept Dropdown */}
          <div className="md:col-span-3 relative">
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full bg-white border border-brand-olivelight/80 py-2.5 px-3 rounded-xl focus:border-brand-olive outline-none text-sm text-brand-charcoal font-semibold"
            >
              <option value="all">🏥 All Specialties</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Days Filter */}
          <div className="md:col-span-3 relative">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full bg-white border border-brand-olivelight/80 py-2.5 px-3 rounded-xl focus:border-brand-olive outline-none text-sm text-brand-charcoal font-semibold"
            >
              <option value="all">🗓️ Any Working Day</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Clear Reset */}
          <div className="md:col-span-2">
            <motion.button
              onClick={() => {
                setSearchTerm('');
                setSelectedDeptId('all');
                setSelectedDay('all');
              }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 border border-brand-olivelight hover:bg-brand-stone text-brand-charcoal font-bold rounded-xl text-xs tracking-wide transition-colors cursor-pointer bg-white"
            >
              Reset Filters
            </motion.button>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <AnimatePresence mode="popLayout">
        {filteredDoctors.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-brand-stone p-12 text-center rounded-2xl border border-dashed border-brand-olivelight"
          >
            <Filter className="w-12 h-12 text-brand-clay mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-brand-charcoal">No Specialists Match Your Filter</h3>
            <p className="text-brand-clay text-sm mt-1 max-w-sm mx-auto">
              Try resetting your search filters or selecting 'Any Working Day' to browse all Board-Certified doctors.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDoctors.map((doc) => (
              <motion.div
                key={doc.id}
                variants={itemVariants}
                layout
                whileHover={{ y: -5, scale: 1.015 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-brand-olivelight rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header elements */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${doc.image} bg-brand-stone text-brand-olive flex items-center justify-center font-bold text-xl shrink-0 font-serif shadow-sm`}>
                      {doc.name.split(' ').map(n => n.startsWith('Dr.') ? '' : n[0]).join('')}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-olive bg-brand-olivesoft px-2.5 py-0.5 rounded border border-brand-olivelight/40 inline-block font-sans">
                        {getDeptName(doc.departmentId)}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-brand-charcoal mt-1 leading-snug">{doc.name}</h3>
                      <p className="text-xs text-brand-clay font-medium">{doc.role}</p>
                    </div>
                  </div>

                  <hr className="border-brand-olivesoft" />

                  {/* Body details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-brand-clay">
                      <span className="font-semibold flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-brand-clay" /> Degree
                      </span>
                      <span className="text-brand-charcoal font-medium truncate max-w-[150px]">{doc.education.split(' - ')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between text-brand-clay">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-brand-clay" /> Experience
                      </span>
                      <span className="text-brand-charcoal font-bold font-mono">{doc.experienceYears} Years</span>
                    </div>
                    <div className="flex items-center justify-between text-brand-clay">
                      <span className="font-semibold flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-brand-clay" /> Consulting Fee
                      </span>
                      <span className="text-brand-charcoal font-bold font-mono">${doc.consultingFee}</span>
                    </div>
                  </div>

                  <p className="text-xs text-brand-clay italic font-serif line-clamp-3">
                    "{doc.bio}"
                  </p>
                </div>

                {/* Booking Actions */}
                <div className="mt-6 pt-4 border-t border-brand-olivesoft flex items-center gap-2">
                  <motion.button
                    onClick={() => setFocusedDoc(doc)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 bg-brand-stone hover:bg-brand-stone/80 text-brand-charcoal font-bold rounded-xl text-xs transition-colors cursor-pointer border border-brand-olivelight/60"
                  >
                    View Profile
                  </motion.button>
                  <motion.button
                    onClick={() => selectDoctorAndBook(doc.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 bg-brand-olive hover:bg-brand-olivedark text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    Book Slot
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
