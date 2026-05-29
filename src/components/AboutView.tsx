import { Shield, Award, Users2, Stethoscope, Heart, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

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
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 120, damping: 18 } 
  }
};

export default function AboutView() {
  const Milestones = [
    { year: '2016', title: 'Founded with a Vision', desc: 'SelfHeal was founded under the premise that healthcare should be comforting, transparent, and completely slot-centric without endless queues.' },
    { year: '2020', title: 'Surgical Excellence Wing', desc: 'Opened our highly functional rehabilitation and minimal-invasive orthopedic theaters, leading joint preservation therapies.' },
    { year: '2023', title: 'Top Hospital Accreditation', desc: 'Ranked five stars for patient safety standards, diagnostic speeds, and post-surgery rehabilitation protocols.' },
    { year: '2026', title: 'Going Fully Outpatient Digitized', desc: 'Launched our premium real-time digital appointment, cardless reception check-out, and continuous chat triage setup.' }
  ];

  return (
    <div className="space-y-16">
      {/* Narrative Intro */}
      <motion.section 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-3xl mx-auto space-y-6"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-brand-olive bg-brand-olivesoft px-3 py-1 rounded-full border border-brand-olivelight">
          Our Narrative
        </span>
        <h1 className="text-4xl font-serif text-brand-charcoal tracking-tight sm:text-5xl">
          Hospital Care, <span className="italic font-normal text-brand-olive">Reimagined</span> for Healing
        </h1>
        <p className="text-base text-brand-clay leading-relaxed font-sans">
          Founded in 2016 with a patient-centric philosophy, SelfHeal Hospitals acts as a sanctuary of premium clinical excellence. We reject traditional grid-locked hospital operations in favor of spacious lounges, guaranteed appointments times, and deeply human medical interactions.
        </p>
      </motion.section>

      {/* Philosophy Pillars */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {[
          { icon: Heart, title: 'Restorative Hospitality', desc: 'We design every room, lobby, and clinic to be sound-buffered, welcoming, and warm to significantly reduce medical check-up anxiety.' },
          { icon: Shield, title: 'Board-Certified Exclusivity', desc: 'Every clinical associate, surgeon, and advisor undergoes vetting. We focus on high consulting times with patients.' },
          { icon: Award, title: 'No Double-Booking Integrity', desc: 'Our electronic queueing systems align perfectly with real doctor availability. Your selected hour is yours alone.' }
        ].map((item, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.015 }}
            className="bg-brand-stone border border-brand-olivelight/60 p-8 rounded-2xl space-y-4"
          >
            <div className="p-3 bg-brand-olivesoft text-brand-olive rounded-xl inline-block border border-brand-olivelight/30">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-brand-charcoal">{item.title}</h3>
            <p className="text-brand-clay text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* History Timeline */}
      <section className="space-y-8">
        <div className="text-center space-y-3 block">
          <h2 className="text-3xl font-serif text-brand-charcoal tracking-tight">Our Timeline of Clinical Milestones</h2>
          <p className="text-brand-clay text-sm max-w-xl mx-auto">
            A continuous path of modern medical performance, expansion, and user validation.
          </p>
        </div>

        <div className="relative border-l-2 border-brand-olivelight/80 max-w-3xl mx-auto pl-8 space-y-12">
          {Milestones.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              {/* Timeline marker */}
              <div className="absolute -left-[41px] top-1.5 bg-brand-olive text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs ring-4 ring-brand-sand">
                ✓
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-olive bg-brand-olivesoft px-2.5 py-0.5 rounded-full border border-brand-olivelight">
                  {m.year}
                </span>
                <h4 className="text-lg font-serif font-bold text-brand-charcoal pt-1">{m.title}</h4>
                <p className="text-brand-clay text-sm leading-relaxed">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Accreditation Badges Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-brand-charcoal text-white rounded-[32px] p-8 sm:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-olive/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif tracking-tight text-brand-stone">World-Class Accreditations</h2>
            <p className="text-brand-olivelight/80 text-sm leading-relaxed">
              SelfHeal Hospitals operates in permanent synergy with global healthcare auditing bodies. This guarantee ensures medical compliance, premium hygiene audits, and high-trust pharmacy practices.
            </p>
            <ul className="space-y-3 text-brand-stone/90 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-olivelight" /> Fully Accredited Clinic Operations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-olivelight" /> FDA-approved Medical Scanners & Gear
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-olivelight" /> 100% Secure Digital Medical Records Encryption
              </li>
            </ul>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { title: 'Global Health Commission', score: 'Five Stars' },
              { title: 'Care Cleanliness Audit', score: '99.9%' },
              { title: 'Diagnostics Speed Rating', score: 'A+' },
              { title: 'Pharmacy Compliance', score: '100% Sync' }
            ].map((badge, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 border border-brand-olivelight/20 p-5 rounded-2xl text-center space-y-1"
              >
                <span className="text-brand-olivelight font-serif text-xl font-bold block">{badge.score}</span>
                <span className="text-brand-stone/80 text-xs font-medium block">{badge.title}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
