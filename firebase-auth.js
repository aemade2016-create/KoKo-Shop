// Firebase Authentication Functions
import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Google Provider
const googleProvider = new GoogleAuthProvider();

// Facebook Provider
const facebookProvider = new FacebookAuthProvider();

// Sign Up with Email and Password
export async function signUpWithEmail(name, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with name
        await updateProfile(user, {
            displayName: name
        });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            createdAt: serverTimestamp(),
            orders: [],
            wishlist: []
        });

        return { success: true, user: user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// Sign In with Email and Password
export async function signInWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign In with Google
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const isAdmin = (user.email === 'aemade2016@gmail.com');

        let profileData = {
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL || '',
            role: isAdmin ? 'admin' : 'customer',
            isAdmin: isAdmin,
            isBlocked: false,
            orders: [],
            wishlist: []
        };

        // Check and sync user document in Firestore
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    ...profileData,
                    createdAt: serverTimestamp()
                });
            } else {
                const existingData = userDoc.data();
                profileData = {
                    ...profileData,
                    ...existingData,
                    name: user.displayName || existingData.name || profileData.name,
                    photoURL: user.photoURL || existingData.photoURL || profileData.photoURL
                };
            }
        } catch (dbErr) {
            console.warn('Firestore profile sync warning:', dbErr);
        }

        return { success: true, user: user, userData: profileData };
    } catch (error) {
        console.error('Google sign in error:', error);
        return { success: false, error: error.message, code: error.code || 'auth/unknown' };
    }
}

// Sign In with Facebook
export async function signInWithFacebook() {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;
        const isAdmin = (user.email === 'aemade2016@gmail.com');

        let profileData = {
            uid: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL || '',
            role: isAdmin ? 'admin' : 'customer',
            isAdmin: isAdmin,
            isBlocked: false,
            orders: [],
            wishlist: []
        };

        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    ...profileData,
                    createdAt: serverTimestamp()
                });
            } else {
                const existingData = userDoc.data();
                profileData = {
                    ...profileData,
                    ...existingData,
                    name: user.displayName || existingData.name || profileData.name,
                    photoURL: user.photoURL || existingData.photoURL || profileData.photoURL
                };
            }
        } catch (dbErr) {
            console.warn('Firestore Facebook profile sync warning:', dbErr);
        }

        return { success: true, user: user, userData: profileData };
    } catch (error) {
        console.error('Facebook sign in error:', error);
        return { success: false, error: error.message, code: error.code || 'auth/unknown' };
    }
}

// Sign Out
export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// Get Current User
export function getCurrentUser() {
    return auth.currentUser;
}

// Auth State Observer
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Get User Data from Firestore
export async function getUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Get user data error:', error);
        return { success: false, error: error.message };
    }
}

// Update User Data
export async function updateUserData(uid, data) {
    try {
        await updateDoc(doc(db, 'users', uid), data);
        return { success: true };
    } catch (error) {
        console.error('Update user data error:', error);
        return { success: false, error: error.message };
    }
}
