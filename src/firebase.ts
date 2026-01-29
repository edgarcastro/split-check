import {initializeApp, FirebaseApp} from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  AppCheck,
} from 'firebase/app-check';
import {
  getFunctions,
  connectFunctionsEmulator,
  Functions,
} from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'split-check-41cb9.firebaseapp.com',
  projectId: 'split-check-41cb9',
  storageBucket: 'split-check-41cb9.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Functions with emulator support in development
export const functions: Functions = getFunctions(app);
if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

let appCheck: AppCheck | null = null;

export function initializeFirebaseAppCheck(): AppCheck | null {
  if (appCheck) return appCheck;

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (!recaptchaSiteKey) {
    console.warn(
      'App Check: Missing VITE_RECAPTCHA_SITE_KEY, skipping initialization',
    );
    return null;
  }

  // Enable debug token in development
  if (import.meta.env.DEV) {
    // @ts-expect-error - Debug property for App Check
    self.FIREBASE_APPCHECK_DEBUG_TOKEN =
      import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  }

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });

  return appCheck;
}
