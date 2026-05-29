import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "./FirebaseProvider";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { Appointment, Doctor } from "../types";
import { DEPARTMENTS, DOCTORS } from "../data";
import {
  Shield,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Plus,
  Search,
  X,
  Check,
  AlertCircle,
  Lock,
  LogIn,
  Briefcase,
  Phone,
  Mail,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  Clock,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ListTodo,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminView() {
  const { user, signInWithEmail, signOut, signInWithGoogle } = useAuth();

  // Credentials requested by user:
  const ADMIN_EMAIL = "sampletest1129@gmail.com";
  const ADMIN_PASSWORD = "test@123";

  // Auth local state for admin portal login
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Bookings list state
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "Confirmed" | "Rescheduled" | "Cancelled" | "Rejected"
  >("All");

  // Add Booking modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newDeptId, setNewDeptId] = useState("cardiology");
  const [newDoctorId, setNewDoctorId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [newReason, setNewReason] = useState("Routine Outpatient Diagnostics");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Reschedule inline modal state
  const [reschedulingAppointment, setReschedulingAppointment] = useState<
    any | null
  >(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Patient History view modal state
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);

  // Sandbox-friendly cancel/reject confirmation state
  const [confirmModalData, setConfirmModalData] = useState<{
    id: string;
    patientName: string;
    type: "cancel" | "reject";
    appointment: any;
  } | null>(null);

  // Custom visual notification state (replacing window.alert)
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(
        (curr: { message: string; type: "success" | "error" } | null) =>
          curr?.message === message ? null : curr,
      );
    }, 4500);
  };

  // Check if current authenticated user is the verified admin
  const isCurrentlyAdmin =
    user && user.email?.toLowerCase() === "sampletest1129@gmail.com";

  // Watch & monitor clinical state across all patients using top-level collections
  useEffect(() => {
    if (!isCurrentlyAdmin) {
      setAllBookings([]);
      setIsLoadingBookings(false);
      setUsersList([]);
      return;
    }

    setIsLoadingBookings(true);

    // Subscribe to users collection to facilitate user matching when booking as admin
    const usersRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(
      usersRef,
      (usersSnap) => {
        const uList = usersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsersList(uList);
      },
      (err) => {
        console.error("Error monitoring users in Admin Console:", err);
      },
    );

    // Subscribe to global bookings collection
    const bookingsRef = collection(db, "bookings");
    const unsubscribeBookings = onSnapshot(
      bookingsRef,
      (bookingsSnap) => {
        const list: Appointment[] = [];
        bookingsSnap.forEach((bDoc) => {
          const data = bDoc.data();
          let formattedCreatedAt = new Date().toISOString();
          if (data.createdAt && typeof data.createdAt.toDate === "function") {
            formattedCreatedAt = data.createdAt.toDate().toISOString();
          } else if (data.createdAt instanceof Date) {
            formattedCreatedAt = data.createdAt.toISOString();
          }

          list.push({
            id: bDoc.id,
            userId: data.userId || "",
            patientName: data.patientName || "Anonymous",
            patientEmail: data.patientEmail || "",
            patientPhone: data.patientPhone || "",
            doctorId: data.doctorId || "",
            departmentId: data.departmentId || "",
            doctorName: data.doctorName || "",
            department: data.department || "",
            date: data.date || "",
            timeSlot: data.timeSlot || "",
            reason: data.reason || "General Consulting Diagnostic",
            status: data.status || "pending",
            createdAt: formattedCreatedAt,
          } as any);
        });

        // Sort descending by createdAt
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setAllBookings(list);
        setIsLoadingBookings(false);
      },
      (err) => {
        console.error("Error monitoring bookings in Admin Console:", err);
        setIsLoadingBookings(false);
      },
    );

    return () => {
      unsubscribeUsers();
      unsubscribeBookings();
    };
  }, [isCurrentlyAdmin]);

  // Set default doctor when department changes in the booking form
  useEffect(() => {
    const applicableDoctors = DOCTORS.filter(
      (d) => d.departmentId === newDeptId,
    );
    if (applicableDoctors.length > 0) {
      setNewDoctorId(applicableDoctors[0].id);
    } else {
      setNewDoctorId("");
    }
  }, [newDeptId]);

  // Handle Admin Email Sign In
  const handleAdminAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setResetSuccessMessage("");

    const formattedEmail = adminEmailInput.trim();
    const cleanPassword = adminPasswordInput.trim();

    const isEmailValidAdmin =
      formattedEmail.toLowerCase() === "sampletest1129@gmail.com";

    if (!isEmailValidAdmin || cleanPassword !== ADMIN_PASSWORD) {
      setAuthError("Unauthorized Admin credentials. Access Denied.");
      setAuthLoading(false);
      return;
    }

    try {
      // Direct Firebase Login using standard credentials
      await signInWithEmail(formattedEmail, cleanPassword);
    } catch (err: any) {
      console.log(
        "Admin sign in failed (possibly because account doesn't exist yet). Trying auto-registration...",
      );
      try {
        // Attempt implicit clinical admin setup
        const { createUserWithEmailAndPassword, updateProfile } =
          await import("firebase/auth");
        const { auth } = await import("../firebase");
        const userCred = await createUserWithEmailAndPassword(
          auth,
          formattedEmail,
          cleanPassword,
        );
        await updateProfile(userCred.user, {
          displayName: "Senior Clinical Director (Admin)",
        });

        // Store user details
        await setDoc(doc(db, "users", userCred.user.uid), {
          userId: userCred.user.uid,
          fullName: "Senior Clinical Director (Admin)",
          email: formattedEmail,
          phone: "+1 (555) 123-ADMIN",
          createdAt: serverTimestamp(),
        });
      } catch (regErr: any) {
        console.error("Admin auto-registration failed:", regErr);
        if (regErr.code === "auth/email-already-in-use") {
          setAuthError(
            "An account for this email exists but the credentials provided do not match. Check if the password is correct.",
          );
        } else {
          setAuthError(
            `Clinical Gate Authenticator Error: ${regErr.message || regErr.code || err.message}`,
          );
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Google Sign In bypass bypass for admin email matching
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError("");
    setResetSuccessMessage("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google sign in failed:", err);
      if (
        err.code === "auth/unauthorized-domain" ||
        err.message?.includes("unauthorized-domain")
      ) {
        setAuthError(`Google Auth Domain Blocked: Add the following URLs to your 'Authorized Domains' in the Firebase Authentication console:
• ais-dev-eepkf224jtxwsjijhry3hj-573376177053.asia-southeast1.run.app
• ais-pre-eepkf224jtxwsjijhry3hj-573376177053.asia-southeast1.run.app`);
      } else {
        setAuthError(
          `Google Authentication failed: ${err.message || err.code}`,
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Password reset dispatch tool
  const handleResetPassword = async () => {
    setResetLoading(true);
    setResetSuccessMessage("");
    setAuthError("");
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("../firebase");
      await sendPasswordResetEmail(auth, ADMIN_EMAIL);
      setResetSuccessMessage(
        `A secure password reset link has been dispatched to ${ADMIN_EMAIL}. Please check your inbox / spam folder.`,
      );
    } catch (err: any) {
      console.error("Password reset dispatch failed:", err);
      setAuthError(
        `Failed to dispatch password reset link: ${err.message || err.code}`,
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Quick Action: Cancel booking
  const handleCancelBooking = (appointment: any) => {
    setConfirmModalData({
      id: appointment.id,
      patientName: appointment.patientName || "Anonymous",
      type: "cancel",
      appointment,
    });
  };

  // Quick Action: Confirm pending booking
  const handleConfirmBooking = async (appointment: any) => {
    try {
      const docRef = doc(db, "bookings", appointment.id);
      await updateDoc(docRef, { status: "Confirmed" });
      showNotification(
        `Successfully accepted the booking for "${appointment.patientName}".`,
        "success",
      );
    } catch (err: any) {
      showNotification(`Could not confirm booking: ${err.message}`, "error");
    }
  };

  // Quick Action: Reject pending booking
  const handleRejectBooking = (appointment: any) => {
    setConfirmModalData({
      id: appointment.id,
      patientName: appointment.patientName || "Anonymous",
      type: "reject",
      appointment,
    });
  };

  // Quick Action: Reactivate/Confirm booking
  const handleReactivateBooking = async (appointment: any) => {
    try {
      const docRef = doc(db, "bookings", appointment.id);
      await updateDoc(docRef, { status: "Confirmed" });
      showNotification(
        `Successfully reactivated & confirmed booking for "${appointment.patientName}".`,
        "success",
      );
    } catch (err: any) {
      showNotification(`Could not reactivate booking: ${err.message}`, "error");
    }
  };

  // Execute actual database action once custom modal confirms
  const executeConfirmedAction = async () => {
    if (!confirmModalData) return;
    const { type, appointment } = confirmModalData;
    setConfirmModalData(null);
    try {
      const docRef = doc(db, "bookings", appointment.id);
      if (type === "cancel") {
        await updateDoc(docRef, { status: "Cancelled" });
        showNotification(
          `The outpatient pass ${appointment.id} for "${appointment.patientName}" has been successfully cancelled.`,
          "success",
        );
      } else if (type === "reject") {
        await updateDoc(docRef, { status: "rejected" });
        showNotification(
          `The booking for "${appointment.patientName}" has been successfully rejected.`,
          "success",
        );
      }
    } catch (err: any) {
      showNotification(`Could not complete action: ${err.message}`, "error");
    }
  };

  // Set up values for rescheduling
  const openReschedulePanel = (appointment: any) => {
    setReschedulingAppointment(appointment);
    setRescheduleDate(appointment.date);
    setRescheduleSlot(appointment.timeSlot);
  };

  // Handle Reschedule save
  const handleSaveReschedule = async () => {
    if (!reschedulingAppointment) return;
    setRescheduleLoading(true);
    try {
      const docRef = doc(db, "bookings", reschedulingAppointment.id);
      await updateDoc(docRef, {
        date: rescheduleDate,
        timeSlot: rescheduleSlot,
        status: "Rescheduled",
      });
      showNotification(
        `Rescheduled slot to ${rescheduleDate} at ${rescheduleSlot} successfully.`,
        "success",
      );
      setReschedulingAppointment(null);
    } catch (err: any) {
      showNotification(`Could not reschedule: ${err.message}`, "error");
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Find dynamic corresponding Doctor configuration
  const findDoctor = (docId: string): Doctor | undefined => {
    return DOCTORS.find((d) => d.id === docId);
  };

  // Find department label helper
  const findDeptLabel = (deptId: string): string => {
    return DEPARTMENTS.find((d) => d.id === deptId)?.name || deptId;
  };

  // Handle submitting new booking created by the Admin
  const handleCreateAdminBooking = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");

    if (
      !newPatientName.trim() ||
      !newPatientEmail.trim() ||
      !newPatientPhone.trim() ||
      !newDate ||
      !newTimeSlot
    ) {
      setSubmitError("Please fill out all patient credentials & slots.");
      setSubmitLoading(false);
      return;
    }

    try {
      // Step A: Check if a user with this email already exists in our active registry
      const lowercaseEmail = newPatientEmail.trim().toLowerCase();
      let matchedUser = usersList.find(
        (u: any) => u.email?.toLowerCase() === lowercaseEmail,
      );
      let targetUserId = matchedUser?.id || "";

      // Step B: If student/patient not registered, auto-generate a valid user account
      if (!targetUserId) {
        // Generate pseudo unique id for patient
        targetUserId = `patient-gen-${Math.floor(100000 + Math.random() * 900000)}`;
        const newUserDocRef = doc(db, "users", targetUserId);

        await setDoc(newUserDocRef, {
          userId: targetUserId,
          fullName: newPatientName.trim(),
          email: newPatientEmail.trim(),
          phone: newPatientPhone.trim(),
          createdAt: serverTimestamp(),
        });
      }

      // Step C: Book slot inside the bookings collection
      const generatedBookingId = `SH-${Math.floor(100000 + Math.random() * 900000)}`;
      const bookingDocRef = doc(db, "bookings", generatedBookingId);

      const doctorObj = DOCTORS.find((d) => d.id === newDoctorId);
      const resolvedDoctorName = doctorObj ? doctorObj.name : "Unknown Doctor";
      const deptObj = DEPARTMENTS.find((d) => d.id === newDeptId);
      const resolvedDeptName = deptObj
        ? deptObj.name
        : newDeptId || "General Department";

      const dbPayload = {
        id: generatedBookingId,
        userId: targetUserId,
        patientName: newPatientName.trim(),
        patientEmail: newPatientEmail.trim(),
        patientPhone: newPatientPhone.trim(),
        doctorId: newDoctorId,
        departmentId: newDeptId,
        doctorName: resolvedDoctorName,
        department: resolvedDeptName,
        date: newDate,
        timeSlot: newTimeSlot,
        reason: newReason || "Routine Outpatient Diagnostics",
        status: "Confirmed",
        createdAt: serverTimestamp(),
      };

      await setDoc(bookingDocRef, dbPayload);

      // Reset fields and close modal
      setNewPatientName("");
      setNewPatientEmail("");
      setNewPatientPhone("");
      setNewReason("Routine Outpatient Diagnostics");
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Admin booking error:", err);
      setSubmitError(
        err.message || "Could not successfully initialize appointment.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Stats Counters
  const totalSlotsCount = allBookings.length;
  const confirmedSlotsCount = allBookings.filter(
    (b: any) => b.status === "Confirmed" || b.status === "Rescheduled",
  ).length;
  const pendingSlotsCount = allBookings.filter(
    (b: any) => b.status === "Pending" || b.status === "pending",
  ).length;
  const cancelledSlotsCount = allBookings.filter(
    (b: any) => b.status === "Cancelled" || b.status === "cancelled",
  ).length;
  const rejectedSlotsCount = allBookings.filter(
    (b: any) => b.status === "Rejected" || b.status === "rejected",
  ).length;
  const calculatedRevenue = allBookings
    .filter(
      (b: any) =>
        b.status !== "Cancelled" &&
        b.status !== "cancelled" &&
        b.status !== "Rejected" &&
        b.status !== "rejected",
    )
    .reduce((sum: number, b: any) => {
      const fee = findDoctor(b.doctorId)?.consultingFee || 100;
      return sum + fee;
    }, 0);

  // Filter & search bookings
  const filteredBookings = allBookings.filter((b: any) => {
    const stringMatch =
      b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patientPhone.includes(searchQuery) ||
      findDoctor(b.doctorId)
        ?.name?.toLowerCase()
        ?.includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch =
      statusFilter === "All" ||
      (statusFilter === "Pending" &&
        (b.status === "Pending" || b.status === "pending")) ||
      (statusFilter === "Confirmed" && b.status === "Confirmed") ||
      (statusFilter === "Rescheduled" && b.status === "Rescheduled") ||
      (statusFilter === "Cancelled" &&
        (b.status === "Cancelled" || b.status === "cancelled")) ||
      (statusFilter === "Rejected" &&
        (b.status === "Rejected" || b.status === "rejected"));

    return stringMatch && statusMatch;
  });

  // Render Login state for unauthorized visitor
  if (!isCurrentlyAdmin) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white border border-brand-olivelight/60 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-brand-charcoal text-white p-7 text-center space-y-1">
            <div className="mx-auto w-10 h-10 rounded-full bg-brand-olive flex items-center justify-center text-white mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold tracking-tight">
              Administrative Control Gate
            </h2>
            <p className="text-[11px] text-brand-olivelight font-mono uppercase tracking-wider">
              System Audits Required
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold flex flex-col gap-1 select-text">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>Authentication Notice</span>
                </div>
                <p className="text-[10px] text-red-600 font-normal leading-normal whitespace-pre-line mt-1">
                  {authError}
                </p>
              </div>
            )}

            {resetSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <Check className="p-0.5 bg-emerald-600 text-white rounded-full w-4.5 h-4.5 shrink-0" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-brand-clay font-bold uppercase tracking-widest block font-mono">
                  Verify Admin ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-clay" />
                  <input
                    type="text"
                    value={adminEmailInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAdminEmailInput(e.target.value)
                    }
                    placeholder="e.g. sampletest1129@gmail.com"
                    className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-brand-charcoal outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-brand-clay font-bold uppercase tracking-widest block font-mono">
                    Administrative Password
                  </label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="text-[10px] text-brand-olive hover:underline font-bold cursor-pointer bg-transparent border-0 outline-none"
                  >
                    {resetLoading
                      ? "Sending Reset Link..."
                      : "Forgot/Reset Password?"}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-clay" />
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-brand-charcoal outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive transition-colors"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-brand-charcoal hover:bg-brand-olive hover:text-white transition-all text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {authLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-brand-olivelight" />
                    <span>Authorize Administrative Seat</span>
                  </>
                )}
              </motion.button>
            </form>

            <div className="relative flex items-center justify-center my-4 py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-stone"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] uppercase font-bold text-brand-clay tracking-wider font-mono">
                Credential Recovery Option
              </span>
            </div>

            <p className="text-[10.5px] text-brand-clay/90 text-center font-medium">
              If your password is different/desynchronized in the database,
              bypass password matching using Google Auth with the admin email:
            </p>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full py-2.5 border border-brand-olivelight hover:bg-brand-stone text-brand-charcoal hover:text-brand-charcoal transition-all font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
            >
              <svg
                className="w-4 h-4 text-red-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.47 1.62l2.427-2.427C17.43 1.71 14.97 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.9 0 10.33-4.15 10.33-10.49 0-.7-.06-1.22-.19-1.7H12.24z" />
              </svg>
              <span>Sign In with Google Account</span>
            </motion.button>

            <div className="pt-2 border-t border-brand-stone text-center">
              <p className="text-[10px] text-brand-clay leading-normal">
                This area is exclusive to Board Directors, IT administration,
                and authenticated hospital coordinators. All administrative
                logins are tracked in the security registry.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Admin Panel UI
  return (
    <div
      id="admin-portal-dashboard"
      className="space-y-8 animate-fade-in text-left"
    >
      {/* Title Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-olivelight/40 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-olive">
            <Shield className="w-4.5 h-4.5" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold bg-brand-olivesoft px-2.5 py-1 rounded-full">
              Secure Admin Workspace
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-brand-charcoal mt-2.5 tracking-tight">
            SelfHeal Outpatient Command
          </h1>
          <p className="text-xs text-brand-clay mt-1 text-left font-medium">
            Review live hospital calendar schedules, coordinate specialists
            lists, and reserve emergency outpatient passes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-brand-olive hover:bg-brand-olivedark text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Booking (Admin)
          </button>

          <button
            onClick={() => {
              signOut();
            }}
            className="px-4 py-2.5 bg-brand-stone hover:bg-red-50 hover:text-red-700 text-brand-charcoal border border-brand-olivelight/60 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Sign Out Admin
          </button>
        </div>
      </div>

      {/* Numerical Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Booked passes */}
        <div className="bg-white border border-brand-olivelight/40 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-clay">
              Total Outpatient Passes
            </p>
            <p className="text-2xl font-serif font-bold text-brand-charcoal">
              {totalSlotsCount}
            </p>
          </div>
          <div className="p-3 bg-brand-stone rounded-xl text-brand-charcoal">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Total Confirmed & Rescheduled active */}
        <div className="bg-white border border-brand-olivelight/40 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-clay">
              Confirmed Slots
            </p>
            <p className="text-2xl font-serif font-bold text-brand-olive">
              {confirmedSlotsCount}
            </p>
          </div>
          <div className="p-3 bg-brand-olivesoft rounded-xl text-brand-olive">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Decisions */}
        <div className="bg-white border border-brand-olivelight/40 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-clay">
              Pending Decisions
            </p>
            <p className="text-2xl font-serif font-bold text-amber-600">
              {pendingSlotsCount}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Calculated Revenue generated */}
        <div className="bg-white border border-brand-olivelight/40 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-clay font-sans">
              Revenue Pool
            </p>
            <p className="text-2xl font-serif font-bold text-emerald-700">
              ${calculatedRevenue}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main interactive panel */}
      <div className="bg-white border border-brand-olivelight/40 rounded-2xl shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 bg-brand-stone/40 border-b border-brand-olivelight/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-clay" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, Phone, Email, Pass ID, Doctor..."
              className="w-full bg-white border border-brand-olivelight/70 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-brand-charcoal outline-none focus:ring-1 focus:ring-brand-olive"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-brand-stone text-brand-clay"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Status Filter */}
          <div className="flex flex-wrap bg-white p-1 rounded-xl shadow-sm border border-brand-stone gap-1">
            {(
              [
                "All",
                "Pending",
                "Confirmed",
                "Rescheduled",
                "Cancelled",
                "Rejected",
              ] as const
            ).map((filterOpt) => (
              <button
                key={filterOpt}
                onClick={() => setStatusFilter(filterOpt)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  statusFilter === filterOpt
                    ? "bg-brand-olive text-white shadow-sm"
                    : "text-brand-clay hover:text-brand-charcoal"
                }`}
              >
                {filterOpt}
              </button>
            ))}
          </div>
        </div>

        {/* Table/List Area */}
        {isLoadingBookings ? (
          <div className="p-12 text-center text-xs text-brand-clay flex flex-col items-center justify-center gap-2">
            <span className="w-6 h-6 border-2 border-brand-olive border-t-transparent rounded-full animate-spin"></span>
            <span className="font-semibold uppercase tracking-wider font-mono">
              Loading Cloud Outpatient Logs...
            </span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-clay space-y-1">
            <Briefcase className="w-8 h-8 mx-auto text-brand-olivelight mb-2" />
            <p className="font-bold text-brand-charcoal">
              No Matching Clinical Booking Logs Found
            </p>
            <p className="font-normal text-[11px]">
              Adjust your filter parameter terms or schedule a new appointment
              from the dashboard.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-stone bg-brand-stone/20 text-[10px] uppercase font-bold text-brand-clay tracking-wider">
                  <th className="p-4">Pass ID</th>
                  <th className="p-4">Patient Profile</th>
                  <th className="p-4">Primary Physician / Wing</th>
                  <th className="p-4">Slotted Date & Time</th>
                  <th className="p-4">Security Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-stone">
                {filteredBookings.map((app) => {
                  const matchedDoc = findDoctor(app.doctorId);
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-brand-stone/10 transition-colors text-xs font-semibold text-brand-charcoal"
                    >
                      {/* Booking Pass ID */}
                      <td className="p-4">
                        <span className="font-mono text-[10px] bg-brand-stone px-2 py-1 rounded text-brand-charcoal font-bold">
                          {app.id}
                        </span>
                      </td>

                      {/* Patient Info */}
                      <td className="p-4">
                        <div className="leading-tight">
                          <p
                            onClick={() =>
                              setSelectedPatientHistory({
                                name: app.patientName || "Anonymous",
                                email: app.patientEmail || "",
                                phone: app.patientPhone || "",
                              })
                            }
                            className="font-bold text-brand-charcoal hover:text-brand-olive hover:underline transition-all cursor-pointer text-xs flex items-center gap-1"
                            title="Click to view full medical history"
                          >
                            <History className="w-3 h-3 text-brand-olive opacity-80 shrink-0" />
                            {app.patientName}
                          </p>
                          <p className="text-[10px] text-brand-clay font-normal">
                            {app.patientEmail}
                          </p>
                          <p className="text-[9px] text-brand-clay/80 font-mono mt-0.5">
                            {app.patientPhone}
                          </p>
                        </div>
                      </td>

                      {/* Doctor & Department */}
                      <td className="p-4">
                        <div className="leading-tight">
                          <p className="text-brand-charcoal">
                            {matchedDoc?.name || "Unassigned Physician"}
                          </p>
                          <p className="text-[10px] text-brand-olive font-bold uppercase tracking-wider mt-0.5">
                            {findDeptLabel(app.departmentId)}
                          </p>
                        </div>
                      </td>

                      {/* Date & Time Slot */}
                      <td className="p-4">
                        <div className="leading-tight">
                          <p className="text-brand-charcoal flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-brand-olive shrink-0" />
                            {app.date}
                          </p>
                          <p className="text-[10.5px] text-brand-clay font-normal mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand-clay shrink-0" />
                            {app.timeSlot}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            app.status === "Cancelled" ||
                            app.status === "cancelled" ||
                            app.status === "rejected" ||
                            app.status === "Rejected"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : app.status === "Pending" ||
                                  app.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                                : app.status === "Rescheduled"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === "Pending" ||
                          app.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleConfirmBooking(app)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <Check className="w-3 h-3 text-white" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectBooking(app)}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <X className="w-3.5 h-3.5 text-white" />
                                Reject
                              </button>
                            </>
                          ) : app.status !== "Cancelled" &&
                            app.status !== "cancelled" &&
                            app.status !== "rejected" &&
                            app.status !== "Rejected" ? (
                            <>
                              <button
                                onClick={() => openReschedulePanel(app)}
                                title="Reschedule Date/Hour"
                                className="p-1.5 bg-brand-stone hover:bg-brand-olivesoft hover:text-brand-olive text-brand-clay rounded-lg transition-all cursor-pointer"
                              >
                                <CalendarDays className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancelBooking(app)}
                                title="Revoke Admissions"
                                className="p-1.5 bg-brand-stone hover:bg-red-50 hover:text-red-700 text-brand-clay rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleReactivateBooking(app)}
                              title="Reactivate/Confirm Outpatient Pass"
                              className="px-2 py-1 bg-brand-stone hover:bg-emerald-50 hover:text-emerald-700 text-brand-clay rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Re-Confirm
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD BOOKING FROM ADMIN END */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop shadow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-xs"
            />

            {/* Content box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-brand-olivelight shadow-2xl rounded-3xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Top bar header */}
              <div className="bg-brand-charcoal text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-olivelight" />
                  <h3 className="text-sm font-serif font-bold">
                    Register Patient Booking (Command view)
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-brand-olivelight hover:text-white rounded p-1 transition-all"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form
                onSubmit={handleCreateAdminBooking}
                className="p-6 space-y-4 overflow-y-auto flex-1 text-left"
              >
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Patient Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive"
                      required
                    />
                  </div>

                  {/* Patient Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                      Patient Email Address
                    </label>
                    <input
                      type="email"
                      value={newPatientEmail}
                      onChange={(e) => setNewPatientEmail(e.target.value)}
                      placeholder="e.g. johndoe@gmail.com"
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Patient Telephone */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                      Patient Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newPatientPhone}
                      onChange={(e) => setNewPatientPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 765-4321"
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive"
                      required
                    />
                  </div>

                  {/* Clinical Department selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                      Medical Speciality
                    </label>
                    <select
                      value={newDeptId}
                      onChange={(e) => setNewDeptId(e.target.value)}
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-bold text-brand-charcoal outline-none focus:border-brand-olive"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Doctor selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                      Assigned Physician
                    </label>
                    <select
                      value={newDoctorId}
                      onChange={(e) => setNewDoctorId(e.target.value)}
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-bold text-brand-charcoal outline-none focus:border-brand-olive"
                    >
                      {DOCTORS.filter((d) => d.departmentId === newDeptId).map(
                        (docObj) => (
                          <option key={docObj.id} value={docObj.id}>
                            {docObj.name} (${docObj.consultingFee})
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  {/* Date Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Slot selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                      Clinical Timeslot Slot
                    </label>
                    <select
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-bold text-brand-charcoal outline-none focus:border-brand-olive"
                      required
                    >
                      <option value="">-- Choose Timeslot --</option>
                      {(
                        findDoctor(newDoctorId)?.availability?.slots || [
                          "09:00 AM",
                          "10:00 AM",
                          "11:00 AM",
                          "02:00 PM",
                          "03:00 PM",
                        ]
                      ).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Consulting Reason */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                      Clinical Symptoms Reason
                    </label>
                    <input
                      type="text"
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      placeholder="e.g. Regular EKG checkup"
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-stone flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-brand-olivelight text-xs font-bold text-brand-charcoal hover:bg-brand-stone transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2.5 rounded-xl bg-brand-olive hover:bg-brand-olivedark text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    {submitLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirm & Reserve Pass
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INLINE APPOINTMENT RESCHEDULING */}
      <AnimatePresence>
        {reschedulingAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReschedulingAppointment(null)}
              className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-xs"
            />

            {/* Modal box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-brand-olivelight shadow-2xl rounded-[24px] max-w-sm w-full overflow-hidden text-left"
            >
              <div className="bg-brand-charcoal text-white p-4 flex items-center justify-between">
                <span className="text-xs font-serif font-bold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-olivelight" />
                  Reschedule Pass {reschedulingAppointment.id}
                </span>
                <button
                  onClick={() => setReschedulingAppointment(null)}
                  className="text-brand-olivelight hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-xs space-y-1">
                  <p className="text-brand-clay uppercase tracking-widest text-[9px] font-mono font-bold">
                    Rescheduling For
                  </p>
                  <p className="font-bold text-brand-charcoal text-sm">
                    {reschedulingAppointment.patientName}
                  </p>
                  <p className="text-brand-clay font-normal">
                    {reschedulingAppointment.patientEmail}
                  </p>
                </div>

                {/* New Date */}
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                    New Diagnostic Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive"
                    required
                  />
                </div>

                {/* New Slot */}
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">
                    Available Hourly Slot
                  </label>
                  <select
                    value={rescheduleSlot}
                    onChange={(e) => setRescheduleSlot(e.target.value)}
                    className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2 px-3 text-xs font-bold text-brand-charcoal outline-none focus:border-brand-olive"
                    required
                  >
                    {(
                      findDoctor(reschedulingAppointment.doctorId)?.availability
                        ?.slots || [
                        "09:00 AM",
                        "10:00 AM",
                        "11:00 AM",
                        "02:00 PM",
                        "03:00 PM",
                      ]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    onClick={() => setReschedulingAppointment(null)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-brand-stone text-brand-charcoal transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReschedule}
                    disabled={rescheduleLoading}
                    className="px-4 py-2 bg-brand-olive hover:bg-brand-olivedark text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {rescheduleLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: PATIENT HISTORY VIEW */}
      <AnimatePresence>
        {selectedPatientHistory &&
          (() => {
            const patientBookings = allBookings.filter(
              (b) =>
                (selectedPatientHistory.email &&
                  b.patientEmail?.toLowerCase() ===
                    selectedPatientHistory.email.toLowerCase()) ||
                b.patientName?.toLowerCase() ===
                  selectedPatientHistory.name.toLowerCase(),
            );

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedPatientHistory(null)}
                  className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-xs"
                />

                {/* Modal box */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative bg-white border border-brand-olivelight shadow-2xl rounded-[24px] max-w-2xl w-full overflow-hidden text-left"
                >
                  {/* Header */}
                  <div className="bg-brand-charcoal text-white p-5 flex items-center justify-between">
                    <span className="text-sm font-serif font-bold flex items-center gap-2">
                      <History className="w-4 h-4 text-brand-olivelight" />
                      Medical Pass History: {selectedPatientHistory.name}
                    </span>
                    <button
                      onClick={() => setSelectedPatientHistory(null)}
                      className="text-brand-olivelight hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto w-full">
                    {/* Patient Info Card */}
                    <div className="bg-brand-sand border border-brand-stone/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] text-brand-clay uppercase tracking-widest font-mono font-bold">
                          Patient Records
                        </p>
                        <h4 className="text-base font-bold text-brand-charcoal mt-1">
                          {selectedPatientHistory.name}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-brand-clay font-medium">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-brand-clay/60" />
                            {selectedPatientHistory.email ||
                              "No email provided"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-brand-clay/60" />
                            {selectedPatientHistory.phone ||
                              "No phone provided"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white border border-brand-olivelight/60 rounded-xl px-4 py-3 flex flex-col items-center justify-center text-center shrink-0 min-w-[120px]">
                        <span className="text-2xl font-bold text-brand-olive">
                          {patientBookings.length}
                        </span>
                        <span className="text-[10px] text-brand-clay font-bold uppercase tracking-wider mt-0.5">
                          Total Passes
                        </span>
                      </div>
                    </div>

                    {/* List of bookings */}
                    <div className="space-y-3">
                      <h5 className="text-xs text-brand-clay uppercase tracking-widest font-mono font-bold">
                        Past & Upcoming Admissions
                      </h5>

                      {patientBookings.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-brand-stone/60 rounded-2xl text-brand-clay font-normal text-xs">
                          No previous medical pass entries found for this
                          patient.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                          {patientBookings.map((b) => {
                            const docObj = findDoctor(b.doctorId);
                            const isCancelledOrRejected =
                              b.status === "Cancelled" ||
                              b.status === "cancelled" ||
                              b.status === "rejected" ||
                              b.status === "Rejected";
                            const isPending =
                              b.status === "Pending" || b.status === "pending";

                            return (
                              <div
                                key={b.id}
                                className="border border-brand-stone/50 hover:border-brand-olivelight/60 rounded-xl p-4 transition-all hover:bg-brand-sand/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] bg-brand-stone px-2 py-0.5 rounded text-brand-charcoal font-bold">
                                      {b.id}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                        isCancelledOrRejected
                                          ? "bg-red-50 text-red-700 border-red-200"
                                          : isPending
                                            ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      }`}
                                    >
                                      {b.status}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-brand-charcoal">
                                    {docObj?.name ||
                                      b.doctorName ||
                                      "Unassigned Doctor"}{" "}
                                    •{" "}
                                    <span className="text-[10px] text-brand-olive font-bold uppercase tracking-wider">
                                      {findDeptLabel(b.departmentId) ||
                                        b.department}
                                    </span>
                                  </p>
                                  <p className="text-[11px] text-brand-clay flex items-center gap-1.5 font-normal">
                                    <CalendarDays className="w-3.5 h-3.5 text-brand-olive shrink-0" />
                                    {b.date} at {b.timeSlot}
                                  </p>
                                  {b.reason && (
                                    <p className="text-[11px] text-brand-charcoal italic bg-brand-stone/30 px-2 py-1 rounded mt-1 font-normal">
                                      "{b.reason}"
                                    </p>
                                  )}
                                </div>
                                <div className="text-[10px] text-brand-clay font-mono self-end sm:self-center font-normal">
                                  Created:{" "}
                                  {new Date(b.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer close option */}
                  <div className="bg-brand-sand/60 px-6 py-4 flex justify-end border-t border-brand-stone/40">
                    <button
                      onClick={() => setSelectedPatientHistory(null)}
                      className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white text-xs font-serif font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Close History
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <div className="fixed top-5 right-5 z-[100] max-w-sm pointer-events-none space-y-2">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start gap-3 bg-white text-xs font-semibold ${
                notification.type === "success"
                  ? "border-emerald-200 text-emerald-800 bg-emerald-50/90"
                  : "border-red-200 text-red-800 bg-red-50/90"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold underline uppercase tracking-wider text-[9px] text-brand-clay mb-0.5">
                  System Notification
                </p>
                <p className="font-medium text-brand-charcoal text-xs leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL 4: QUICK ACTION CONFIRMATION (REJECT / CANCEL) */}
      <AnimatePresence>
        {confirmModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModalData(null)}
              className="absolute inset-0 bg-brand-charcoal/60 backdrop-blur-xs"
            />

            {/* Dialog Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-brand-olivelight shadow-2xl rounded-2xl max-w-md w-full overflow-hidden text-left"
            >
              {/* Header */}
              <div
                className={`p-4 text-white flex items-center justify-between ${
                  confirmModalData.type === "cancel"
                    ? "bg-brand-charcoal"
                    : "bg-red-700"
                }`}
              >
                <span className="text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2">
                  {confirmModalData.type === "cancel" ? (
                    <XCircle className="w-4 h-4 text-brand-olivelight" />
                  ) : (
                    <X className="w-4 h-4 text-red-200" />
                  )}
                  Confirm{" "}
                  {confirmModalData.type === "cancel"
                    ? "Cancellation"
                    : "Rejection"}
                </span>
                <button
                  onClick={() => setConfirmModalData(null)}
                  className="text-white opacity-80 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-brand-charcoal leading-relaxed font-semibold">
                  Are you sure you want to{" "}
                  {confirmModalData.type === "cancel" ? "cancel" : "reject"} the
                  Outpatient Medical Pass for:
                </p>
                <div className="bg-brand-sand border border-brand-stone/50 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-widest font-mono text-brand-clay font-bold">
                    Patient Name
                  </p>
                  <p className="text-sm font-bold text-brand-charcoal mt-0.5">
                    {confirmModalData.patientName}
                  </p>
                  <p className="text-[10px] font-mono text-brand-clay mt-1.5">
                    Pass ID: {confirmModalData.id}
                  </p>
                </div>
                <p className="text-[10px] text-brand-clay italic leading-normal font-normal">
                  This will update the booking status in the hospital database
                  and update the patient's record. This action can be
                  re-confirmed later if requested.
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="bg-brand-sand/50 px-5 py-3 border-t border-brand-stone/40 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setConfirmModalData(null)}
                  className="px-4 py-2 bg-brand-stone hover:bg-brand-stone/80 text-brand-charcoal text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                  Dismiss
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className={`px-4 py-2 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 ${
                    confirmModalData.type === "cancel"
                      ? "bg-brand-charcoal hover:bg-brand-charcoal/95"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {confirmModalData.type === "cancel" ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Pass
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5" />
                      Reject Pass
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
