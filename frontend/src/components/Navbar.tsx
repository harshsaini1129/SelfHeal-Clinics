import { useState } from "react";
import {
  Stethoscope,
  Menu,
  X,
  CalendarDays,
  LogOut,
  User,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useAuth } from "./FirebaseProvider";

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export default function Navbar({ currentTab, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, userProfile, signOut, appointments } = useAuth();

  // Quantify confirmed appointments reactively via Firebase Auth provider
  const activeCount = appointments.filter(
    (appt) => appt.status === "Confirmed",
  ).length;

  const menuItems = [
    { id: "home", label: "Home" },
    { id: "departments", label: "Departments" },
    { id: "doctors", label: "Doctors" },
    { id: "about", label: "About Us" },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-brand-olivelight sticky top-0 z-50 transition-all duration-150">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between h-20">
        {/* Brand Logo */}
        <button
          id="brand-logo-btn"
          onClick={() => {
            onNavigate("home");
            setMobileOpen(false);
          }}
          className="flex items-center gap-3 text-brand-charcoal font-bold tracking-tight text-xl text-left hover:opacity-85 transition-opacity"
        >
          <div className="p-2.5 bg-brand-olive text-white rounded-xl flex items-center justify-center shadow-sm">
            <Stethoscope className="w-5.5 h-5.5" />
          </div>
          <div className="leading-none">
            <span className="block font-serif text-xl italic text-brand-charcoal">
              SelfHeal
            </span>
            <span className="block text-[10px] font-mono text-brand-clay font-bold uppercase tracking-widest mt-1">
              Hospitals
            </span>
          </div>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-brand-olive bg-brand-olivesoft border border-brand-olivelight font-bold"
                    : "text-brand-clay hover:text-brand-charcoal"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop Admission Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigate("admin")}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border ${
              currentTab === "admin"
                ? "bg-brand-charcoal text-white font-bold border-brand-charcoal"
                : "bg-white hover:bg-brand-stone border-brand-olivelight text-brand-charcoal"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-brand-olive shrink-0" />
            Admin Portal
          </button>

          {!user && (
            <button
              id="nav-my-bookings-btn"
              onClick={() => onNavigate("mybookings")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border ${
                currentTab === "mybookings"
                  ? "bg-brand-olive border-brand-olive text-white font-bold"
                  : "bg-white hover:bg-brand-stone border-brand-olivelight text-brand-charcoal"
              }`}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              My Bookings
            </button>
          )}

          <button
            id="nav-book-btn"
            onClick={() => onNavigate("book")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              currentTab === "book"
                ? "bg-brand-charcoal text-white font-bold"
                : "bg-brand-olive hover:bg-brand-olivedark text-white hover:-translate-y-0.25"
            }`}
          >
            Book Appointment
          </button>

          {/* User Profile Info / Dropdown User Dashboard */}
          {user ? (
            <div className="relative">
              <button
                id="user-dashboard-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 border-l border-brand-olivelight pl-4 ml-1 hover:opacity-90 transition-opacity cursor-pointer text-left focus:outline-none"
              >
                <div className="text-right leading-tight max-w-[120px]">
                  <span className="block text-[11px] font-bold text-brand-charcoal truncate">
                    {userProfile?.fullName || user.displayName || "Patient"}
                  </span>
                  <span className="block text-[9px] text-brand-clay font-bold uppercase tracking-wider">
                    Outpatient Card
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-olive text-white flex items-center justify-center font-extrabold text-xs shadow-sm uppercase shrink-0">
                  {(userProfile?.fullName || user.displayName || "P").charAt(0)}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-brand-clay transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Click-outside backdrop */}
              {dropdownOpen && (
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setDropdownOpen(false)}
                />
              )}

              {/* Interactive Dashboard Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3.5 w-72 bg-white border border-brand-olivelight rounded-2xl shadow-xl py-3.5 z-50 animate-fade-in text-left">
                  <div className="px-4 pb-3 border-b border-brand-stone mb-2.5">
                    <p className="text-[10px] uppercase font-bold text-brand-clay tracking-widest font-mono">
                      My Account Dashboard
                    </p>
                    <p className="text-sm font-bold text-brand-charcoal mt-1.5 truncate">
                      {userProfile?.fullName ||
                        user.displayName ||
                        "Authorized Patient"}
                    </p>
                    <p className="text-xs text-brand-clay truncate font-normal">
                      {userProfile?.email || user.email}
                    </p>
                    {userProfile?.phone && (
                      <p className="text-[10px] text-brand-clay font-mono mt-0.5 font-normal">
                        {userProfile.phone}
                      </p>
                    )}
                  </div>

                  <div className="px-2 space-y-1">
                    <button
                      onClick={() => {
                        onNavigate("mybookings");
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-left ${
                        currentTab === "mybookings"
                          ? "bg-brand-olivesoft text-brand-olive border border-brand-olivelight/40"
                          : "text-brand-charcoal hover:bg-brand-stone"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-brand-olive shrink-0" />
                        My Outpatient Bookings
                      </span>
                      {activeCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-brand-charcoal text-white font-extrabold text-[10px] animate-pulse">
                          {activeCount}
                        </span>
                      ) : (
                        <span className="text-[9px] text-brand-clay font-semibold">
                          0 active
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onNavigate("book");
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-left ${
                        currentTab === "book"
                          ? "bg-brand-olivesoft text-brand-olive border border-brand-olivelight/40"
                          : "text-brand-charcoal hover:bg-brand-stone"
                      }`}
                    >
                      <User className="w-4 h-4 text-brand-olive shrink-0" />
                      Book New Appointment
                    </button>

                    {user?.email?.toLowerCase() === "sampletest@1129" && (
                      <button
                        onClick={() => {
                          onNavigate("admin");
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-left ${
                          currentTab === "admin"
                            ? "bg-brand-olivesoft text-brand-olive border border-brand-olivelight/40"
                            : "text-brand-charcoal hover:bg-brand-stone"
                        }`}
                      >
                        <Shield className="w-4 h-4 text-brand-olive shrink-0" />
                        Admin Outpatient Control
                      </button>
                    )}
                  </div>

                  <div className="border-t border-brand-stone mt-3 pt-2 px-2">
                    <button
                      onClick={() => {
                        signOut();
                        onNavigate("home");
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-600 shrink-0" />
                      Sign Out Outpatient
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate("mybookings")}
              className="px-4 py-2.5 text-xs text-brand-olive bg-brand-olivesoft hover:bg-brand-olivelight rounded-xl font-bold transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2.5 text-brand-clay hover:bg-brand-stone hover:text-brand-charcoal rounded-xl transition-colors"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-olivelight bg-white p-5 space-y-4 absolute top-20 left-0 w-full shadow-lg z-40 animate-fade-in">
          <div className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl text-sm font-bold text-left transition-colors ${
                    isActive
                      ? "text-brand-olive bg-brand-olivesoft font-bold"
                      : "text-brand-clay hover:text-brand-charcoal"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <hr className="border-brand-olivelight animate-pulse" />

          {/* Mobile Profile & Priority Actions */}
          <div className="flex flex-col gap-2">
            {user && (
              <div className="bg-brand-stone rounded-2xl p-4 flex items-center justify-between border border-brand-olivelight/40 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white text-brand-olive rounded-xl border border-brand-olivelight">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-brand-charcoal">
                      {userProfile?.fullName ||
                        user.displayName ||
                        "Authorized Patient"}
                    </span>
                    <span className="block text-[10px] text-brand-clay font-medium">
                      {user.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    onNavigate("home");
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs text-red-700 font-bold hover:underline"
                >
                  <LogOut className="w-4 h-4" />
                  Leave
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onNavigate("admin");
                setMobileOpen(false);
              }}
              className="w-full text-center py-2.5 border border-brand-charcoal text-white bg-brand-charcoal hover:bg-opacity-95 font-bold rounded-xl text-xs flex justify-center items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-brand-olivelight" />
              Admin Control Center
            </button>

            <button
              onClick={() => {
                onNavigate("mybookings");
                setMobileOpen(false);
              }}
              className="w-full text-center py-2.5 border border-brand-olivelight hover:bg-brand-stone text-brand-charcoal font-bold rounded-xl text-xs flex justify-center items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4" />
              My Bookings ({activeCount} Active)
            </button>
            <button
              onClick={() => {
                onNavigate("book");
                setMobileOpen(false);
              }}
              className="w-full text-center py-3 bg-brand-olive hover:bg-brand-olivedark text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
