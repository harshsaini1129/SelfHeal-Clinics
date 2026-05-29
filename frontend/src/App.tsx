import { useState } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import DepartmentsView from './components/DepartmentsView';
import DoctorsView from './components/DoctorsView';
import BookingForm from './components/BookingForm';
import MyBookingsView from './components/MyBookingsView';
import AdminView from './components/AdminView';
import AIChatbot from './components/AIChatbot';
import { HeartPulse, Stethoscope, Phone, Mail, MapPin, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [subArg, setSubArg] = useState<string | null>(null);

  // Handles smooth simulated routing of tabs and captures dynamic arguments
  const handleNavigation = (tab: string, arg?: string) => {
    setCurrentTab(tab);
    if (arg) {
      setSubArg(arg);
    } else {
      setSubArg(null);
    }
    // Smooth scroll to top when changing page views
    window.scrollTo({ top: 0, behavior: 'instant' as const });
  };

  const handleBookingSuccess = () => {
    // Redirect to my bookings to let them audit their Admission Pass ticket
    setCurrentTab('mybookings');
    setSubArg(null);
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView onNavigate={handleNavigation} />;
      case 'about':
        return <AboutView />;
      case 'departments':
        return (
          <DepartmentsView
            initialSelectedDept={subArg}
            onNavigate={handleNavigation}
          />
        );
      case 'doctors':
        return (
          <DoctorsView
            initialSelectedDoctorId={subArg}
            onNavigate={handleNavigation}
          />
        );
      case 'book':
        return (
          <BookingForm
            preFilledArg={subArg}
            onBookingSuccess={handleBookingSuccess}
          />
        );
      case 'mybookings':
        return (
          <MyBookingsView
            onNavigateToBook={() => handleNavigation('book')}
          />
        );
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-sand text-brand-charcoal flex flex-col font-sans">
      {/* Dynamic Accessible Top Header */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigation} />

      {/* Primary Outpatient Screen Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-12 py-10 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Professional Hospital Footer */}
      <footer className="bg-brand-charcoal text-white pt-16 pb-8 border-t border-brand-olivelight/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-brand-olivelight/10 pb-12">
          
          {/* Column 1: Outpatient Brand and Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-olive text-white rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-serif italic text-lg text-white">SelfHeal Hospitals</span>
            </div>
            <p className="text-xs text-brand-olivelight/80 leading-normal max-w-xs font-light">
              Designing patient-first out-patient healthcare clinics, focused on slot efficiency, validated board-certified consultants, and restorative recovery lounges.
            </p>
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-brand-olivelight uppercase tracking-widest text-[10px]">Clinical Hours</p>
              <p className="text-brand-stone font-normal">Outpatient: 08:00 AM – 06:00 PM (Daily)</p>
              <p className="text-brand-stone font-normal">Inpatient Wards: 24/7 Cover</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">Clinical Navigation</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Specialities & Departments', tab: 'departments' },
                { label: 'Physicians Directory', tab: 'doctors' },
                { label: 'Institutional About Us', tab: 'about' },
                { label: 'Register Slots', tab: 'book' },
                { label: 'Track Admission Passes', tab: 'mybookings' },
                { label: 'Admin Portal (Coordinators)', tab: 'admin' }
              ].map((link, j) => (
                <button
                  key={j}
                  onClick={() => handleNavigation(link.tab)}
                  className="text-left text-brand-olivelight/70 hover:text-white transition-colors font-medium cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Medical Units */}
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">Key Specialities</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { name: 'Cardiology Unit', id: 'cardiology' },
                { name: 'Neurological Wing', id: 'neurology' },
                { name: 'Child Pediatrics Care', id: 'pediatrics' },
                { name: 'Orthopedics Joints Clinic', id: 'orthopedics' },
                { name: 'Aesthetic Dermatology', id: 'dermatology' }
              ].map((item, keyIdx) => (
                <button
                  key={keyIdx}
                  onClick={() => handleNavigation('departments', item.id)}
                  className="text-left text-brand-olivelight/70 hover:text-white transition-colors font-semibold cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Column 4: Location Contact Info */}
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-brand-olivelight" />
              Institutional Support
            </h4>
            <p className="text-brand-olivelight/80 font-light leading-normal">
              Need immediate digital triage or outpatient assistance? Reach our clinical care team now.
            </p>
            <div className="space-y-2.5 text-brand-stone font-medium font-sans">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-olivelight shrink-0" />
                <span>1-800-SELFHEAL (Help)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-olivelight shrink-0" />
                <span>care@selfheal.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-olivelight shrink-0" />
                <span className="leading-normal">70 Medical Parkway, Tower B, Level 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Declaration */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-brand-clay font-medium">
          <p>© 2026 SelfHeal Healthcare Institutions. All board-certified credentials verified. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="cursor-pointer hover:text-white transition-colors">Privacy Charter</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-white transition-colors">Digital Outpatient Standards</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-white transition-colors">Clinical Disclosures</span>
          </div>
        </div>
      </footer>

      {/* Floating AI Navigation Assistant */}
      <AIChatbot onNavigate={handleNavigation} />
    </div>
  );
}
