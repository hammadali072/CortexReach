import { 
    getAuth, 
    updateProfile, 
    updatePassword, 
    reauthenticateWithCredential, 
    EmailAuthProvider,
    deleteUser
} from 'firebase/auth';
import { 
    ref, 
    get, 
    set, 
    update,
    query, 
    orderByChild, 
    equalTo 
} from 'firebase/database';
import { auth, db as rtdb } from '../firebase';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * USER SETTINGS (REALTIME DATABASE)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Fetch user settings. If doc doesn't exist, return default values.
export const getUserSettings = async (uid) => {
    const sRef = ref(rtdb, `userSettings/${uid}`);
    const snapshot = await get(sRef);
    
    if (!snapshot.exists()) {
        return {
            displayName: '',
            fromName: '',
            fromEmail: '',
            replyToEmail: '',
            resendApiKey: '',
            dailySendLimit: 100,
            delayBetweenEmails: 60,
            trackOpens: true,
            aiTone: 'professional',
            aiLanguage: 'english',
            companyName: '',
            companyDescription: '',
            notifyOnOpen: false,
            digestFrequency: 'never',
        };
    }
    return snapshot.val();
};

// Save partial settings
export const saveUserSettings = async (uid, data) => {
    const sRef = ref(rtdb, `userSettings/${uid}`);
    await update(sRef, { 
        ...data, 
        updatedAt: Date.now() 
    });
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTH PROFILE OPERATIONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Update Firebase Auth display name
export const updateUserProfile = async (displayName) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
    }
};

// Change password
export const changeUserPassword = async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DANGER ZONE OPERATIONS (RTDB + FIREBASE AUTH)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Delete all leads across all projects for this user
export const deleteAllLeads = async (uid) => {
    const leadsRef = ref(rtdb, 'leads');
    const q = query(leadsRef, orderByChild('userId'), equalTo(uid));
    const snapshot = await get(q);
    
    if (snapshot.exists()) {
        const leads = snapshot.val();
        const updates = {};
        Object.keys(leads).forEach(key => {
            updates[key] = null;
        });
        await update(leadsRef, updates);
    }
    
    // Also reset stats for all user projects
    const projectsRef = ref(rtdb, 'projects');
    const pq = query(projectsRef, orderByChild('userId'), equalTo(uid));
    const pSnapshot = await get(pq);
    
    if (pSnapshot.exists()) {
        const projects = pSnapshot.val();
        const pUpdates = {};
        Object.keys(projects).forEach(pid => {
            pUpdates[`${pid}/stats/totalLeads`] = 0;
            pUpdates[`${pid}/stats/totalSent`] = 0;
            pUpdates[`${pid}/stats/totalOpened`] = 0;
            pUpdates[`${pid}/stats/totalReplied`] = 0;
        });
        await update(projectsRef, pUpdates);
    }
};

// Delete user account (Firestore data + RTDB data + Auth account)
export const deleteUserAccount = async (uid, password) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    // 1. Reauthenticate first
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // 2. Delete userSettings (RTDB)
    await set(ref(rtdb, `userSettings/${uid}`), null);

    // 3. Delete all RTDB data owned by user
    const collections = ['projects', 'leads', 'campaigns', 'campaign_audience', 'email_sends'];
    
    for (const coll of collections) {
        const collRef = ref(rtdb, coll);
        // Assuming every item in these collections has a 'userId' field
        const q = query(collRef, orderByChild('userId'), equalTo(uid));
        const snapshot = await get(q);
        
        if (snapshot.exists()) {
            const items = snapshot.val();
            const updates = {};
            Object.keys(items).forEach(key => {
                updates[key] = null;
            });
            await update(collRef, updates);
        }
    }
    
    // Special case for users node in RTDB
    await set(ref(rtdb, `users/${uid}`), null);

    // 4. Delete Firebase Auth account
    await deleteUser(user);
};
