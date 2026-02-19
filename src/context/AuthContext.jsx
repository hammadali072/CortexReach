// src/context/AuthContext.jsx
// Global authentication + user-profile context for CortexReach.
// Wraps the entire app so any component can read currentUser / userProfile.

import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../firebase';

// ─── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);   // Firebase Auth user
    const [userProfile, setUserProfile] = useState(null);   // DB user record
    const [authLoading, setAuthLoading] = useState(true);   // initial auth check

    // ── Listen to Firebase Auth state ──────────────────────────────────────
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Fetch profile from DB every time session is restored
                try {
                    const snapshot = await get(ref(db, `users/${user.uid}`));
                    if (snapshot.exists()) {
                        setUserProfile(snapshot.val());
                    }
                } catch (err) {
                    console.error('[AuthContext] Failed to load user profile:', err);
                }
            } else {
                setUserProfile(null);
            }
            setAuthLoading(false);
        });
        return unsubscribe;
    }, []);

    // ── Sign Up ────────────────────────────────────────────────────────────
    // Creates Firebase Auth user, then writes to users/{uid} if not already present.
    const signUp = async ({ name, email, password }) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = credential.user.uid;

        const userRef = ref(db, `users/${uid}`);
        const snapshot = await get(userRef);

        // Prevent duplicate write
        if (!snapshot.exists()) {
            const profile = {
                uid,
                name,
                email,
                role: 'owner',
                createdAt: Date.now(),
                subscriptionPlan: 'free',
            };
            await set(userRef, profile);
            setUserProfile(profile);
        } else {
            setUserProfile(snapshot.val());
        }

        return credential.user;
    };

    // ── Sign In ────────────────────────────────────────────────────────────
    // Authenticates and fetches the DB profile.
    const signIn = async ({ email, password }) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const uid = credential.user.uid;

        const snapshot = await get(ref(db, `users/${uid}`));
        if (snapshot.exists()) {
            setUserProfile(snapshot.val());
        }

        return credential.user;
    };

    // ── Sign Out ────────────────────────────────────────────────────────────
    const logout = async () => {
        await signOut(auth);
        setCurrentUser(null);
        setUserProfile(null);
    };

    const value = {
        currentUser,
        userProfile,
        authLoading,
        signUp,
        signIn,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};
