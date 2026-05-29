import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { Appointment } from '../types';
import { DEPARTMENTS, DOCTORS } from '../data';

interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt?: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  appointments: Appointment[];
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'userId' | 'status' | 'createdAt'>) => Promise<Appointment>;
  cancelAppointment: (bookingId: string) => Promise<void>;
  rescheduleAppointment: (bookingId: string, date: string, timeSlot: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
}

export default function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch user profile from Firestore users/{uid}
          const profileRef = doc(db, 'users', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            setUserProfile(profileSnap.data() as UserProfile);
          } else {
            // Document doesn't exist, create profile document synchronously
            const displayParts = currentUser.displayName?.split(' ') || [];
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              fullName: currentUser.displayName || 'Authorized Patient',
              email: currentUser.email || '',
              phone: currentUser.phoneNumber || '',
              createdAt: serverTimestamp()
            };
            
            await setDoc(profileRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Could not fetch user profile", err);
        }
      } else {
        setUserProfile(null);
        setAppointments([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Monitor Bookings for Authenticated User
  useEffect(() => {
    if (!user) {
      setAppointments([]);
      return;
    }

    const bookingsRef = collection(db, "bookings");

    const unsubscribe = onSnapshot(bookingsRef, (snapshot) => {
      const list: Appointment[] = [];
      snapshot.forEach((snapDoc) => {
        const data = snapDoc.data();
        // For "My Bookings" page: Filter bookings using: booking.userId === auth.currentUser.uid
        if (data.userId !== user.uid) {
          return;
        }

        let formattedCreatedAt = new Date().toISOString();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          formattedCreatedAt = data.createdAt.toDate().toISOString();
        } else if (data.createdAt instanceof Date) {
          formattedCreatedAt = data.createdAt.toISOString();
        }

        list.push({
          id: snapDoc.id,
          userId: data.userId || user.uid,
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          patientPhone: data.patientPhone,
          doctorId: data.doctorId,
          departmentId: data.departmentId,
          doctorName: data.doctorName,
          department: data.department,
          date: data.date,
          timeSlot: data.timeSlot,
          reason: data.reason,
          status: data.status,
          createdAt: formattedCreatedAt
        } as Appointment);
      });
      // Sort client-side descending to avoid needing compound index
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAppointments(list);
    }, (error) => {
      console.error("Could not load real-time database snap", error);
      handleFirestoreError(error, OperationType.GET, `bookings`);
    });

    return unsubscribe;
  }, [user]);

  // Auth Operations
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google Auth error", err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      await updateProfile(createdUser, {
        displayName: fullName
      });

      // Explicitly trigger the profile insertion
      const profileRef = doc(db, 'users', createdUser.uid);
      const newProfile: UserProfile = {
        userId: createdUser.uid,
        fullName,
        email,
        phone,
        createdAt: serverTimestamp()
      };
      
      await setDoc(profileRef, newProfile);
      setUserProfile(newProfile);
    } catch (err) {
      console.error("Sign up error", err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Sign in error", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Sign out error", err);
      throw err;
    }
  };

  // Booking Operations
  const addAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'userId' | 'status' | 'createdAt'>
  ): Promise<Appointment> => {
    if (!user) {
      throw new Error("Patient must be logged in to schedule dates.");
    }

    const generatedId = `SH-${Math.floor(100000 + Math.random() * 900000)}`;
    const path = `bookings/${generatedId}`;
    
    const doctorObj = DOCTORS.find(d => d.id === appointmentData.doctorId);
    const resolvedDoctorName = doctorObj ? doctorObj.name : 'Unknown Doctor';
    const deptObj = DEPARTMENTS.find(d => d.id === appointmentData.departmentId);
    const resolvedDeptName = deptObj ? deptObj.name : (appointmentData.departmentId || 'General Department');

    const dbPayload = {
      id: generatedId,
      userId: user.uid,
      patientName: appointmentData.patientName,
      patientEmail: appointmentData.patientEmail,
      patientPhone: appointmentData.patientPhone,
      doctorId: appointmentData.doctorId,
      departmentId: appointmentData.departmentId,
      doctorName: resolvedDoctorName,
      department: resolvedDeptName,
      date: appointmentData.date,
      timeSlot: appointmentData.timeSlot,
      reason: appointmentData.reason || 'General Consulting Diagnostic',
      status: 'pending' as const,
      createdAt: serverTimestamp()
    };

    try {
      const docRef = doc(db, 'bookings', generatedId);
      await setDoc(docRef, dbPayload);
      
      return {
        id: generatedId,
        userId: user.uid,
        patientName: appointmentData.patientName,
        patientEmail: appointmentData.patientEmail,
        patientPhone: appointmentData.patientPhone,
        doctorId: appointmentData.doctorId,
        departmentId: appointmentData.departmentId,
        doctorName: resolvedDoctorName,
        department: resolvedDeptName,
        date: appointmentData.date,
        timeSlot: appointmentData.timeSlot,
        reason: dbPayload.reason,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      throw err;
    }
  };

  const cancelAppointment = async (bookingId: string) => {
    if (!user) return;
    const path = `bookings/${bookingId}`;
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, { status: 'Cancelled' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const rescheduleAppointment = async (bookingId: string, date: string, timeSlot: string) => {
    if (!user) return;
    const path = `bookings/${bookingId}`;
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, { 
        status: 'pending', 
        date, 
        timeSlot 
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      appointments,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      signOut,
      addAppointment,
      cancelAppointment,
      rescheduleAppointment
    }}>
      {children}
    </AuthContext.Provider>
  );
}
