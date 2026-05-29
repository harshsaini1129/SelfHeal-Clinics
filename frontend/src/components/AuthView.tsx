import { useState, FormEvent } from 'react';
import { useAuth } from './FirebaseProvider';
import { Mail, Lock, User, Phone, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthViewProps {
  onSuccess?: () => void;
  titleText?: string;
  subtitleText?: string;
}

export default function AuthView({ onSuccess, titleText, subtitleText }: AuthViewProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Send password reset email
  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address in the input field first, then click reset.');
      setResetSuccessMsg('');
      return;
    }
    setResetLoading(true);
    setResetSuccessMsg('');
    setErrorMsg('');
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('../firebase');
      await sendPasswordResetEmail(auth, email.trim());
      setResetSuccessMsg(`A secure password recovery link has been dispatched to ${email.trim()}.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to send password reset email: ${err.message || err.code}`);
    } finally {
      setResetLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setResetSuccessMsg('');

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please fill in all security fields.');
      }
      
      if (isSignUp) {
        if (!fullName.trim()) throw new Error('Please enter your full patient name.');
        if (!phone.trim()) throw new Error('Please enter a valid telephone hotline.');
        
        await signUpWithEmail(email.trim(), password, fullName.trim(), phone.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      let cleanMessage = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        cleanMessage = 'Invalid email or password combination.';
      } else if (err.code === 'auth/email-already-in-use') {
        cleanMessage = 'This email is already associated with a patient profile. If you forgot your password, enter your email and click "Forgot/Reset Password?" below.';
      } else if (err.code === 'auth/weak-password') {
        cleanMessage = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        cleanMessage = 'Please enter a valid email format.';
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        cleanMessage = `Authorized Domain Blocked: Your active preview workspace is blocked. Please log in to your Firebase Console -> Authentication -> Settings -> Authorized Domains and add:
- ais-dev-eepkf224jtxwsjijhry3hj-573376177053.asia-southeast1.run.app
- ais-pre-eepkf224jtxwsjijhry3hj-573376177053.asia-southeast1.run.app`;
      }
      setErrorMsg(cleanMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    setResetSuccessMsg('');
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setErrorMsg(`Google Auth Domain Blocked: Add the following URLs to your 'Authorized Domains' in the Firebase Authentication console:
• ais-dev-eepkf224jtxwsjijhry3hj-573376177053.asia-southeast1.run.app
• ais-pre-eepkf224jtxwsjijhry3hj-573376177053.asia-southeast1.run.app`);
      } else {
        setErrorMsg('Google Single Sign-On was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-brand-olivelight/60 rounded-3xl overflow-hidden shadow-lg">
      {/* Accent Header Banner */}
      <div className="bg-brand-olive text-white p-6 text-center space-y-1">
        <Sparkles className="w-5 h-5 mx-auto text-brand-olivelight animate-pulse mb-1" />
        <h2 className="text-xl font-serif font-bold tracking-tight">
          {titleText || (isSignUp ? 'Create Patient Pass' : 'Clinical Admission Portal')}
        </h2>
        <p className="text-xs text-brand-olivesoft/90">
          {subtitleText || (isSignUp ? 'Register to manage medical appointments' : 'Sign in to access your admission records')}
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Sign In vs Sign Up Tabs */}
        <div className="flex bg-brand-stone p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
              !isSignUp ? 'bg-white text-brand-olive shadow-sm' : 'text-brand-clay hover:text-brand-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
              isSignUp ? 'bg-white text-brand-olive shadow-sm' : 'text-brand-clay hover:text-brand-charcoal'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 flex flex-col gap-1.5 font-semibold text-left select-text"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 block shrink-0" />
              <span>Authentication Alert</span>
            </div>
            <p className="text-[11px] text-red-600 font-normal leading-relaxed whitespace-pre-line">{errorMsg}</p>
          </motion.div>
        )}

        {resetSuccessMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100 flex items-center gap-2 font-semibold text-left"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetSuccessMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
                key="signup-fields"
              >
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-clay" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Telephone */}
                <div className="space-y-1">
                  <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">Hotline Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-clay" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive transition-colors"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-clay" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@selfheal.com"
                className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-brand-clay font-bold uppercase tracking-wider block">Secured Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="text-[10px] text-brand-olive hover:underline font-bold cursor-pointer bg-transparent border-0 outline-none"
                >
                  {resetLoading ? 'Sending...' : 'Forgot/Reset Password?'}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-clay" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-sand border border-brand-olivelight rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-olive transition-colors"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-olive hover:bg-brand-olivedark text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isSignUp ? 'Generate Profile' : 'Access Clinical Dashboard'}</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Divider separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-olivelight/50"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-[10px] text-brand-clay uppercase tracking-wider font-bold">Or secure access via</span>
          </div>
        </div>

        {/* Google SSO Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-2.5 bg-brand-stone hover:bg-brand-olivesoft text-brand-charcoal border border-brand-olivelight/65 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {/* Flat Google logo */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.564-1.88 4.594-6.887 4.594-4.33 0-7.863-3.585-7.863-8s3.533-8 7.863-8c2.463 0 4.116 1.043 5.056 1.947l3.243-3.125C18.257 1.83 15.539 1 12.24 1 5.48 1 .01 6.37.01 13S5.48 25 12.24 25c7.058 0 11.758-4.908 11.758-11.758 0-.79-.082-1.397-.184-1.957H12.24z"
            />
          </svg>
          <span>Continue with Google</span>
        </motion.button>

        {/* Informative Note */}
        <p className="text-[10px] text-brand-clay text-center leading-normal pt-2 font-medium">
          🔒 Your personal health data is isolated securely under fully audited Firebase compliance rules.
        </p>
      </div>
    </div>
  );
}
