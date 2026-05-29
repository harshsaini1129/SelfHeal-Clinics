import { HeartPulse, Brain, Baby, Activity, Sparkles, Shield, Award, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS } from '../data';
import { motion } from 'motion/react';
// @ts-ignore
import doctorWithClients from '../assets/images/doctor_with_clients_1779908481992.png';

interface HomeViewProps {
  onNavigate: (tab: string, arg?: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 120, damping: 18 } 
  }
};

export default function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden bg-brand-stone border border-brand-olivelight text-brand-charcoal py-20 px-8 sm:px-16 rounded-[32px] shadow-sm"
      >
        {/* Translucent background image of doctor with happy clients */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[32px]">
          <img 
            src={doctorWithClients} 
            alt="Medical doctor with happy clients in background" 
            className="w-full h-full object-cover opacity-[0.28] mix-blend-multiply filter saturate-[1.10] contrast-[1.05]" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-stone/90 via-transparent to-brand-stone/30"></div>
        </div>

        {/* Subtle background glow decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-olivelight/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-olivesoft/90 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <motion.span 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-olive/10 border border-brand-olive/20 text-brand-olive text-xs font-semibold tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-olive animate-pulse"></span>
            Now Welcoming Digital Bookings & Patient Consultations
          </motion.span>

          <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-brand-charcoal leading-tight">
            Empathetic Care. <br />
            <span className="italic text-brand-olive font-normal">Scientific Precision.</span>
          </h1>

          <p className="text-base sm:text-lg text-brand-clay max-w-2xl mx-auto font-sans leading-relaxed">
            Welcome to SelfHeal Hospitals, where industry-leading clinical methodologies meet a restorative healing environment. Secure your verified consultant appointment in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <motion.button
              id="hero-book-btn"
              onClick={() => onNavigate('book')}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 bg-brand-olive hover:bg-brand-olivedark text-white font-bold rounded-xl transition-colors duration-200 shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              Book Priority Appointment
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </motion.button>
            <motion.button
              id="hero-departments-btn"
              onClick={() => onNavigate('departments')}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-brand-stone text-brand-charcoal font-medium rounded-xl border border-brand-olivelight transition-colors duration-200 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Specialities
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Trust & Metric Highlights */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {[
          { icon: Shield, label: 'Clinical Accuracy', value: '99.8%' },
          { icon: Users, label: 'Happy Recoveries', value: '12K+' },
          { icon: Award, label: 'Expert Consultants', value: '45+' },
          { icon: HeartPulse, label: 'Specialties', value: '5 Master' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-brand-sand border border-brand-olivelight/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center space-y-2"
          >
            <div className="p-3 bg-brand-olivesoft text-brand-olive rounded-xl border border-brand-olivelight/40">
              <stat.icon className="w-6 h-6" />
            </div>
            <span className="text-3xl font-serif font-bold text-brand-charcoal tracking-tight">{stat.value}</span>
            <span className="text-xs font-semibold text-brand-clay uppercase tracking-wider">{stat.label}</span>
          </motion.div>
        ))}
      </motion.section>

      {/* Core Specialties Overview */}
      <section className="space-y-8">
        <div className="text-center space-y-3 block">
          <h2 className="text-3xl font-serif text-brand-charcoal tracking-tight">Our Core Clinical Specialities</h2>
          <p className="text-brand-clay text-sm max-w-xl mx-auto">
            SelfHeal Hospitals houses highly specialized medical units configured with leading-edge outpatient diagnostic laboratories.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { id: 'cardiology', name: 'Cardiology Center', desc: 'Heart function screens, dynamic valve assessments, hypertension audits, and state-of-the-art Cath labs.', icon: HeartPulse },
            { id: 'neurology', name: 'Neurological Wing', desc: 'Brain, peripheral nerves, stroke reviews, comprehensive balance clinics, and neuromuscular rehab.', icon: Brain },
            { id: 'pediatrics', name: 'Comprehensive Pediatrics', desc: 'Infants immunization, continuous wellness tracking, friendly child pods, and pediatric allergy cover.', icon: Baby },
          ].map((spec) => (
            <motion.div
              key={spec.id}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.015 }}
              className="bg-white border border-brand-olivelight/80 p-8 rounded-2xl shadow-sm hover:ring-2 hover:ring-brand-olive/20 hover:ring-offset-2 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-4 rounded-xl inline-block bg-brand-olivesoft text-brand-olive">
                  <spec.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-charcoal">{spec.name}</h3>
                <p className="text-brand-clay text-sm leading-relaxed">{spec.desc}</p>
              </div>
              <button
                onClick={() => onNavigate('departments', spec.id)}
                className="mt-6 text-xs font-bold text-brand-olive hover:text-brand-olivedark inline-flex items-center gap-1.5 transition-colors text-left uppercase tracking-wider cursor-pointer group"
              >
                Learn More & View Doctors
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Hospital Pillars */}
      <section className="bg-brand-stone rounded-[28px] p-8 sm:p-12 border border-brand-olivelight/60 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-brand-olive bg-brand-olivesoft px-3 py-1 rounded-full border border-brand-olivelight">
            Why SelfHeal Care
          </span>
          <h3 className="text-3xl font-serif text-brand-charcoal tracking-tight leading-tight">
            A Patient-First Culture Guided by Universal Medical Standards
          </h3>
          <p className="text-brand-clay text-sm leading-relaxed">
            Unlike standard crowded hospital complexes, SelfHeal focuses on outpatient comfort, high clinical consultation times, absolute transparent diagnostics invoicing, and seamless post-consultation remote tracking.
          </p>

          <ul className="space-y-3">
            {[
              'Zero Long Waiting Rooms: Scheduled time slots are guaranteed.',
              'Only Board-Certified Consultants & Senior Clinical Leaders.',
              'Completely transparent lab pricing & prescription audits.',
              'Seamless digital cancellation, rescheduling, and prescription storage.'
            ].map((pillar, index) => (
              <motion.li 
                key={index} 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-start gap-2.5 text-brand-charcoal"
              >
                <CheckCircle2 className="w-5 h-5 text-brand-olive shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{pillar}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.5, type: "spring", stiffness: 90 }}
          className="bg-gradient-to-br from-brand-olive to-brand-olivedark rounded-[24px] p-8 text-white relative overflow-hidden shadow-md h-full flex flex-col justify-between min-h-[300px]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="space-y-4 relative z-10">
            <h4 className="text-2xl font-serif italic text-brand-stone leading-tight">Direct Patient Hotline</h4>
            <p className="text-brand-stone/80 text-sm leading-relaxed max-w-sm">
              Do you have a medical query or require emergency diagnostics transportation? Our concierge team is standing by 24 hours a day, 7 days a week.
            </p>
          </div>
          <div className="pt-8 relative z-10 border-t border-white/20 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs text-brand-olivelight block font-semibold uppercase tracking-wider">Toll-Free Helpline</span>
              <span className="text-2xl font-serif font-bold tracking-tight text-white">1-800-SELFHEAL</span>
            </div>
            <motion.a
              href="mailto:care@selfheal.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs font-bold bg-white text-brand-charcoal px-4 py-2.5 rounded-lg hover:bg-brand-stone transition-colors"
            >
              Email Care Concierge
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* Patient Reviews Testimonials */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-serif text-brand-charcoal tracking-tight">Recoveries That Inspire Us</h2>
          <p className="text-brand-clay text-sm max-w-xl mx-auto">
            Read real feedback from clinical outpatients who successfully completed their clinical recovery pathways with SelfHeal.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div 
              key={t.id} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-brand-sand border border-brand-olivelight p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow duration-300"
            >
              <p className="text-brand-charcoal italic text-sm leading-relaxed font-serif">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 border-t border-brand-olivelight/40 pt-4">
                <div className="w-10 h-10 rounded-full bg-brand-olive text-white flex items-center justify-center font-bold text-sm">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-brand-charcoal">{t.name}, {t.age}</h4>
                  <span className="text-xs text-brand-clay bg-brand-stone border border-brand-olivelight/40 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    Recovered: {t.condition}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
