import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';

// This will be populated by the set_up_firebase tool, or you can replace it with your config.
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-fcd4286c-3f08-4cdb-baac-993bbc9681f1");
export const googleProvider = new GoogleAuthProvider();

export let analytics: any = null;
isSupported().then((yes) => yes ? analytics = getAnalytics(app) : null);

export let messaging: any = null;
isMessagingSupported().then((yes) => yes ? messaging = getMessaging(app) : null);

export { signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification };
