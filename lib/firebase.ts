import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

// Your web app's Firebase configuration (kaamsetu-e47e9)
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDAlN3BJYnhVynBHMPY2vM7VjnC_wy_Tws",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kaamsetu-e47e9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kaamsetu-e47e9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kaamsetu-e47e9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "574359088214",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:574359088214:web:d263b245f2c0a219241ff7",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KHB750S7BM"
};

// Initialize Firebase App safely (singleton pattern across SSR and client)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Initialize Invisible / Visible reCAPTCHA Verifier for Phone OTP
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be initialized in the browser.');
  }

  // Clear existing verifier if any
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('[Firebase Auth] reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.warn('[Firebase Auth] reCAPTCHA expired, reset required');
    }
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send real SMS OTP to Indian/international mobile numbers via Firebase Phone Auth
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string, 
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  // Ensure international format (+91 for India if not specified)
  let formattedPhone = phoneNumber.trim();
  if (!formattedPhone.startsWith('+')) {
    if (formattedPhone.length === 10) {
      formattedPhone = `+91${formattedPhone}`;
    } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
      formattedPhone = `+${formattedPhone}`;
    } else {
      formattedPhone = `+91${formattedPhone}`;
    }
  }

  return await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
}

/**
 * Confirm 6-digit SMS OTP received from Firebase
 */
export async function verifyFirebaseOtp(
  confirmationResult: ConfirmationResult, 
  otpCode: string
) {
  return await confirmationResult.confirm(otpCode.trim());
}

/**
 * Sign In with Google Popup
 */
export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email.trim(), pass);
}

/**
 * Create user with Email and Password
 */
export async function signUpWithEmail(email: string, pass: string) {
  return await createUserWithEmailAndPassword(auth, email.trim(), pass);
}

/**
 * Sign out of Firebase
 */
export async function signOutFirebase() {
  return await firebaseSignOut(auth);
}

/**
 * Get currently authenticated Firebase user ID token
 */
export async function getFirebaseIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await currentUser.getIdToken(true);
}
