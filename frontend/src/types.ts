export interface Doctor {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  education: string;
  bio: string;
  consultingFee: number;
  languages: string[];
  availability: {
    days: string[];
    slots: string[];
  };
  image: string; // fallback SVG representation or URL
}

export interface Department {
  id: string;
  name: string;
  iconName: string; // Lucide icon identifier
  shortDescription: string;
  longDescription: string;
  services: string[];
  features: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  departmentId: string;
  doctorName?: string;
  department?: string;
  date: string;
  timeSlot: string;
  reason: string;
  status: 'Pending' | 'pending' | 'Confirmed' | 'Cancelled' | 'Rescheduled';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  age: number;
  condition: string;
  quote: string;
  rating: number;
  avatarColor: string;
}
