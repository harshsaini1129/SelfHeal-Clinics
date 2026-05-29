import { Department, Doctor, Testimonial } from './types';

export const DEPARTMENTS: Department[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    iconName: 'HeartPulse',
    shortDescription: 'Comprehensive cardiovascular care with advanced diagnostics and individualized therapy.',
    longDescription: 'Our Cardiology Center is dedicated to preventing, diagnosing, and treating deep-seated conditions of the heart and vascular system. Equipped with state-of-the-art non-invasive diagnostics and advanced therapeutic approaches, we deliver high-trust solutions from pediatric murmurs to adult bypass recovery planning.',
    services: [
      'Electrocardiography (ECG/EKG) & Stress Testing',
      'Advanced Echocardiography & Cardiac Imaging',
      'Hypertension & Coronary Artery Disease Management',
      'Preventative Cardiology & Lipid Risk Audits',
      'Heart Rhythm & Arrhythmia Consultations'
    ],
    features: [
      '24/7 Cardiac Emergency Cover',
      'State-of-the-Art Cath Labs',
      'Comprehensive Cardiac Rehabilitation Programs'
    ]
  },
  {
    id: 'neurology',
    name: 'Neurology',
    iconName: 'Brain',
    shortDescription: 'Advanced brain, peripheral nerve, and complex spine diagnostic and therapeutic solutions.',
    longDescription: 'The Neurology Department provides empathetic care for disorders of the absolute central nervous system. Focusing on everything from recurrent neurological headaches to stroke management, neuropathic pain, and sleep impairments, we blend scientific precision with patient-centric therapies.',
    services: [
      'Comprehensive Stroke Evaluation & Secondary Prevention',
      'Migraine, Headaches, and Chronic Craniofacial Pain Clinics',
      'Epilepsy Diagnosis, EEG, and Precision Therapy selection',
      'Neurocognitive Assessment & Dementia Support Care',
      'Movement Disorders, Parkinson’s Care & Fine-Motor Training'
    ],
    features: [
      'Specialized Neuro-imaging Partnerships',
      'Comprehensive Gait & Equilibrium Balance Lab Service',
      'Multidisciplinary Neuro-rehab Workgroups'
    ]
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    iconName: 'Baby',
    shortDescription: 'Friendly, personalized clinical care for infants, children, and young adolescents.',
    longDescription: 'Our Pediatric Care center is designed to offer a warm, comforting space for children while ensuring standard medical precision. We cover regular pediatric growth checks, immunization schedules, dietary audits, and rapid-response treatment for acute pediatric ailments.',
    services: [
      'Newborn Assessments & Post-discharge Baby Care',
      'Universal Childhood Immunizations & Booster Schedules',
      'Developmental Milestones & Neurodiversity Support',
      'Pediatric Allergies, Asthma, & Respiratory Management',
      'Adolescent Health, Behavioral Counselling & Nutritional Plans'
    ],
    features: [
      'Child-Friendly Waiting Lounges & Play Pods',
      'Separated Infection-Controlled Rooms for Ill Children',
      'Adolescent Growth Monitoring Panels'
    ]
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    iconName: 'Activity',
    shortDescription: 'Advanced surgical and physical rehabilitation for bones, joints, and ligaments.',
    longDescription: 'At the Orthopedic Care center, we assist patience in regaining pure mechanical mobility and structural performance. Specializing in degenerative joint conditions, acute musculoskeletal sports injuries, chronic back pain, and bone density preservation programs.',
    services: [
      'Joint Pain Evaluation (Knee, Hip, Shoulder)',
      'Sports Medicine & Minimally Invasive Arthroscopies',
      'Osteoporosis Screenings & Bone Quality Treatments',
      'Herniated Disc & Lower-Back Spine Care Management',
      'Post-fracture Recovery, Splints, & Muscle Rehabilitation'
    ],
    features: [
      'Full Digital X-Ray & MRI Scans on Site',
      'Customized Orthotics & Supportive Insole Design',
      'Dedicated Physiotherapy Center with Certified Trainers'
    ]
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    iconName: 'Sparkles',
    shortDescription: 'Expert clinical and cosmetic dermatology for skin health and aesthetic wellness.',
    longDescription: 'SelfHeal’s Dermatology wing offers diagnostic, medical, and aesthetic care for skin, hair, and nail conditions. Utilizing advanced dermatoscopy for mole assessments to personalized eczema management, target acne routines, and light therapies.',
    services: [
      'Specialized Acne vulgaris & Scar Clearance Therapies',
      'Inflammatory Skin Management (Eczema, Psoriasis, Rosacea)',
      'Digital Dermoscopy & Melanoma Preventive Appraisals',
      'Hair Fall, Scalp Disorders, & Nail Care Interventions',
      'Laser, Microneedling, & Gentle Skin Rejuvenation'
    ],
    features: [
      'Targeted UV-B Phototherapy Cabinets',
      'Non-invasive Skin Moisture & Elasticity Audits',
      'Hypoallergenic Skincare Prescriptions & Formulations'
    ]
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: 'doc-evelyn-ross',
    name: 'Dr. Evelyn Ross',
    role: 'Senior Consultant Cardiologist',
    departmentId: 'cardiology',
    experienceYears: 16,
    rating: 4.9,
    reviewCount: 420,
    education: 'MD, FACC - Johns Hopkins School of Medicine',
    bio: 'Dr. Ross is a nationally recognized cardiologist specializing in preventative coronary health, cardiac imaging, and post-surgery rehabilitation protocols. She is highly praised for her detailed patient education.',
    consultingFee: 140,
    languages: ['English', 'Spanish'],
    availability: {
      days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
    },
    image: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'doc-marcus-vance',
    name: 'Dr. Marcus Vance',
    role: 'Interventional Cardiology Specialist',
    departmentId: 'cardiology',
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 290,
    education: 'MD - Harvard Medical School',
    bio: 'Dr. Vance focuses on structural heart interventions, arterial hypertension management, and lipid wellness programs. He has more than 10 published journals on cardiac flow dynamics.',
    consultingFee: 130,
    languages: ['English', 'German'],
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      slots: ['10:30 AM', '11:30 AM', '01:30 PM', '02:30 PM', '03:30 PM']
    },
    image: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'doc-helena-vance',
    name: 'Dr. Helena Vance',
    role: 'Chief Neurologist',
    departmentId: 'neurology',
    experienceYears: 18,
    rating: 4.9,
    reviewCount: 512,
    education: 'MD, PhD - Stanford University Medical School',
    bio: 'Dr. Helena Vance brings extensive academic and clinical expertise in migraine management, complex neuropathy, neurological headache profiles, and early-stage dementia counseling.',
    consultingFee: 150,
    languages: ['English', 'French'],
    availability: {
      days: ['Tuesday', 'Wednesday', 'Thursday'],
      slots: ['09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM']
    },
    image: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'doc-aarav-mehta',
    name: 'Dr. Aarav Mehta',
    role: 'Consultant Clinical Neurologist',
    departmentId: 'neurology',
    experienceYears: 10,
    rating: 4.7,
    reviewCount: 180,
    education: 'MD - Columbia College of Physicians and Surgeons',
    bio: 'Dr. Mehta specializes in movement tracking, balance restoration, and neuromuscular disorders. He has a patient-first approach to slow-progressive neural recovery.',
    consultingFee: 110,
    languages: ['English', 'Hindi', 'Gujarati'],
    availability: {
      days: ['Monday', 'Tuesday', 'Friday'],
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM']
    },
    image: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'doc-sarah-jenkins',
    name: 'Dr. Sarah Jenkins',
    role: 'Lead Pediatric Practitioner',
    departmentId: 'pediatrics',
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 610,
    education: 'MD, FAAP - Yale School of Medicine',
    bio: 'Dr. Jenkins is highly admired by children and parents alike for her exceptionally warm demeanor, expertise in pediatric asthma, immunization plans, and baby development diagnostics.',
    consultingFee: 100,
    languages: ['English'],
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      slots: ['08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '01:30 PM', '02:30 PM', '03:30 PM']
    },
    image: 'bg-pink-100 text-pink-800'
  },
  {
    id: 'doc-kenji-tanaka',
    name: 'Dr. Kenji Tanaka',
    role: 'Senior Pediatric Associate',
    departmentId: 'pediatrics',
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 230,
    education: 'MD - Kyoto University Faculty of Medicine',
    bio: 'Dr. Tanaka combines advanced pediatric nutrition frameworks with general diagnostic pediatric wellness checkups. He coordinates with child-psychology associates on pediatric cognitive growth.',
    consultingFee: 95,
    languages: ['English', 'Japanese'],
    availability: {
      days: ['Tuesday', 'Wednesday', 'Friday'],
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
    },
    image: 'bg-teal-100 text-teal-800'
  },
  {
    id: 'doc-david-miller',
    name: 'Dr. David Miller',
    role: 'Director of Orthopedics & Joint Clinic',
    departmentId: 'orthopedics',
    experienceYears: 20,
    rating: 4.9,
    reviewCount: 740,
    education: 'MD - UC San Francisco School of Medicine',
    bio: 'Dr. Miller brings two decades of experience in joints preservation, custom knee/hip alignment assessments, sports micro-injuries, and osteoporotic treatment strategies.',
    consultingFee: 145,
    languages: ['English'],
    availability: {
      days: ['Monday', 'Thursday', 'Friday'],
      slots: ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
    },
    image: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'doc-sofia-fayed',
    name: 'Dr. Sofia Al-Fayed',
    role: 'Chief Medical Dermatologist',
    departmentId: 'dermatology',
    experienceYears: 13,
    rating: 4.8,
    reviewCount: 380,
    education: 'MD - McGill University Faculty of Medicine',
    bio: 'Dr. Al-Fayed specializes in adult inflammatory skin conditions, pediatric eczema, safe aesthetic lasers, and preventative molecular moles examination.',
    consultingFee: 120,
    languages: ['English', 'Arabic', 'French'],
    availability: {
      days: ['Tuesday', 'Thursday', 'Friday'],
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM']
    },
    image: 'bg-rose-100 text-rose-800'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Elizabeth Henderson',
    age: 52,
    condition: 'Cardiac Valve Recovery',
    quote: 'The care I received at SelfHeal’s Cardiology center under Dr. Evelyn Ross was nothing short of miraculous. They explained everything down to the cellular mechanics of my therapy.',
    rating: 5,
    avatarColor: 'bg-rose-500'
  },
  {
    id: 't2',
    name: 'Amara Nwosu',
    age: 34,
    condition: 'Chronic Neural Migraines',
    quote: 'Dr. Helena Vance solved migraines I had struggled with for almost a decade. The scheduling and booking was incredibly smooth, and the follow-ups felt deeply empathetic.',
    rating: 5,
    avatarColor: 'bg-indigo-500'
  },
  {
    id: 't3',
    name: 'Liam Peterson',
    age: 9,
    condition: 'Pediatric Asthma Management',
    quote: 'We appreciate Dr. Sarah Jenkins so much! My son Liam actually enjoys visiting the doctor now. The children play pods are beautiful and highly hygienic.',
    rating: 5,
    avatarColor: 'bg-teal-500'
  }
];
