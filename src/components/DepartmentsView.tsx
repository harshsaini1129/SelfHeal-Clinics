import { useState, useEffect } from 'react';
import { HeartPulse, Brain, Baby, Activity, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';
import { DEPARTMENTS, DOCTORS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface DepartmentsViewProps {
  initialSelectedDept?: string | null;
  onNavigate: (tab: string, arg?: string) => void;
  onSelectDoctorForBooking?: (doctorId: string) => void;
}

export default function DepartmentsView({ initialSelectedDept, onNavigate }: DepartmentsViewProps) {
  const [activeDeptId, setActiveDeptId] = useState<string>(DEPARTMENTS[0].id);

  // If the user arrived from home page specializing link:
  useEffect(() => {
    if (initialSelectedDept && DEPARTMENTS.some(d => d.id === initialSelectedDept)) {
      setActiveDeptId(initialSelectedDept);
    }
  }, [initialSelectedDept]);

  const activeDept = DEPARTMENTS.find(d => d.id === activeDeptId) || DEPARTMENTS[0];
  const departmentDoctors = DOCTORS.filter(doc => doc.departmentId === activeDeptId);

  const getIcon = (iconName: string, active: boolean) => {
    const baseClass = `w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`;
    const colorClass = active ? 'text-brand-stone' : 'text-brand-clay group-hover:text-brand-charcoal';
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className={`${baseClass} ${colorClass}`} />;
      case 'Brain':
        return <Brain className={`${baseClass} ${colorClass}`} />;
      case 'Baby':
        return <Baby className={`${baseClass} ${colorClass}`} />;
      case 'Activity':
        return <Activity className={`${baseClass} ${colorClass}`} />;
      case 'Sparkles':
        return <Sparkles className={`${baseClass} ${colorClass}`} />;
      default:
        return <Stethoscope className={`${baseClass} ${colorClass}`} />;
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-3 block">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-olive bg-brand-olivesoft px-3 py-1 rounded-full border border-brand-olivelight">
          Our Departments
        </span>
        <h1 className="text-4xl font-serif text-brand-charcoal tracking-tight leading-tight sm:text-5xl">
          Centers of Clinical Excellence
        </h1>
        <p className="text-brand-clay max-w-xl mx-auto text-sm">
          Select a clinical specialty below to explore advanced diagnoses, core hospital features, and our accredited consulting board.
        </p>
      </div>

      {/* Grid: Nav and Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Toggle List (sidebar look on large screen, tabs on mobile) */}
        <div className="lg:col-span-4 flex flex-col gap-2 bg-brand-stone border border-brand-olivelight/50 p-3 rounded-2xl">
          <span className="px-3 py-2 text-xs font-bold text-brand-clay uppercase tracking-widest hidden lg:block">
            Clinical Units
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {DEPARTMENTS.map((dept) => {
              const itemActive = dept.id === activeDeptId;
              const activeStyle = itemActive
                ? 'bg-brand-olive border-brand-olive text-white shadow-sm'
                : 'bg-white hover:bg-brand-stone border-brand-olivelight/60 text-brand-charcoal';

              return (
                <motion.button
                  key={dept.id}
                  id={`dept-tab-${dept.id}`}
                  onClick={() => setActiveDeptId(dept.id)}
                  whileHover={{ x: itemActive ? 0 : 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group flex items-center justify-between p-4 rounded-xl border text-left font-semibold text-sm cursor-pointer ${activeStyle}`}
                >
                  <div className="flex items-center gap-3">
                    {getIcon(dept.iconName, itemActive)}
                    <span className={itemActive ? 'text-white' : 'text-brand-charcoal'}>{dept.name}</span>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${itemActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Panel */}
        <div className="lg:col-span-8 overflow-hidden w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDeptId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 bg-white border border-brand-olivelight/80 p-6 sm:p-10 rounded-2xl shadow-sm w-full"
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-serif text-brand-charcoal tracking-tight flex items-center gap-3">
                  {activeDept.name} Unit
                </h2>
                <p className="text-brand-clay leading-relaxed font-sans text-sm sm:text-base">
                  {activeDept.longDescription}
                </p>
              </div>

              <hr className="border-brand-olivesoft" />

              {/* Specialties Checklist */}
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-bold text-brand-charcoal">Primary Services & Protocols</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeDept.services.map((service, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-brand-charcoal">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-brand-olive" />
                      <span className="text-sm font-medium leading-normal">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Badges / Amenities */}
              <div className="bg-brand-stone p-6 rounded-xl border border-brand-olivelight/50 space-y-3">
                <h4 className="text-xs font-bold uppercase text-brand-clay tracking-wider">Unit-Specific Credentials</h4>
                <div className="flex flex-wrap gap-2.5">
                  {activeDept.features.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-brand-charcoal border border-brand-olivelight/60 px-3.5 py-1.5 rounded-full"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-olive" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Doctors available in this department */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-brand-olivesoft pb-3">
                  <h3 className="text-lg font-serif font-bold text-brand-charcoal flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-brand-olive" />
                    Specialists in {activeDept.name} ({departmentDoctors.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {departmentDoctors.map((doc) => (
                    <motion.div 
                      key={doc.id} 
                      whileHover={{ y: -3, scale: 1.01 }}
                      className="border border-brand-olivelight/80 p-5 rounded-xl hover:shadow-md transition-all duration-350 flex flex-col justify-between bg-white"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif font-bold text-brand-charcoal hover:text-brand-olive transition-colors text-base">{doc.name}</h4>
                          <span className="text-xs font-semibold px-2 py-0.5 bg-brand-olivesoft text-brand-olive border border-brand-olivelight/40 rounded-md">
                            ★ {doc.rating}
                          </span>
                        </div>
                        <p className="text-xs text-brand-clay font-medium">{doc.role}</p>
                        <p className="text-xs text-brand-clay line-clamp-2 italic font-serif">"{doc.bio}"</p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-brand-olivesoft flex items-center justify-between">
                        <span className="text-xs text-brand-clay font-semibold">
                          Fee: <span className="text-sm font-bold text-brand-charcoal">${doc.consultingFee}</span>
                        </span>
                        <button
                          onClick={() => onNavigate('doctors', doc.id)}
                          className="text-xs font-bold text-brand-olive hover:text-brand-olivedark hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View Profile & Book
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Prompt Direct Booking */}
              <div className="bg-brand-stone p-6 rounded-2xl border border-brand-olivelight/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-brand-charcoal font-serif font-bold text-base">Ready to consult today?</p>
                  <p className="text-brand-clay text-xs mt-0.5">Skip queues. Pre-select {activeDept.name} in our calendar instantly.</p>
                </div>
                <motion.button
                  onClick={() => onNavigate('book', `dept:${activeDept.id}`)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2.5 bg-brand-olive hover:bg-brand-olivedark text-white font-bold rounded-xl transition-colors shadow-md text-sm shrink-0 cursor-pointer"
                >
                  Book {activeDept.name} Slot
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
