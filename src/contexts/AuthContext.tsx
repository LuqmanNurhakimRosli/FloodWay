// Auth Context — wraps Firebase Auth with React Context
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail,
    updatePassword,
    type User,
    type AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthResult {
    error: { message: string } | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<AuthResult>;
    signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
    signInWithGoogle: () => Promise<AuthResult>;
    logOut: () => Promise<void>;
    updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<AuthResult>;
    updateUserEmail: (email: string) => Promise<AuthResult>;
    updateUserPassword: (password: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { error: null };
        } catch (err) {
            const authErr = err as AuthError;
            return { error: { message: getFriendlyError(authErr.code) } };
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<AuthResult> => {
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName });
            setUser({ ...cred.user });
            return { error: null };
        } catch (err) {
            const authErr = err as AuthError;
            return { error: { message: getFriendlyError(authErr.code) } };
        }
    }, []);

    const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
        try {
            await signInWithPopup(auth, googleProvider);
            return { error: null };
        } catch (err) {
            const authErr = err as AuthError;
            return { error: { message: getFriendlyError(authErr.code) } };
        }
    }, []);

    const logOut = useCallback(async () => {
        await signOut(auth);
    }, []);

    const updateUserProfile = useCallback(async (data: { displayName?: string; photoURL?: string }): Promise<AuthResult> => {
        try {
            if (!auth.currentUser) throw new Error('No user logged in');
            await updateProfile(auth.currentUser, data);
            setUser({ ...auth.currentUser });
            return { error: null };
        } catch (err) {
            const authErr = err as AuthError;
            return { error: { message: authErr.message || 'Failed to update profile' } };
        }
    }, []);

    const updateUserEmail = useCallback(async (email: string): Promise<AuthResult> => {
        try {
            if (!auth.currentUser) throw new Error('No user logged in');
            await updateEmail(auth.currentUser, email);
            setUser({ ...auth.currentUser });
            return { error: null };
        } catch (err) {
            const authErr = err as AuthError;
            return { error: { message: getFriendlyError(authErr.code) } };
        }
    }, []);

    const updateUserPassword = useCallback(async (password: string): Promise<AuthResult> => {
        try {
            if (!auth.currentUser) throw new Error('No user logged in');
            await updatePassword(auth.currentUser, password);
            return { error: null };
        } catch (err) {
            const authErr = err as AuthError;
            return { error: { message: getFriendlyError(authErr.code) } };
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            signInWithGoogle,
            logOut,
            updateUserProfile,
            updateUserEmail,
            updateUserPassword,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

function getFriendlyError(code: string): string {
    const messages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed.',
        'auth/cancelled-popup-request': 'Sign-in was cancelled.',
        'auth/requires-recent-login': 'Please sign out and back in to perform this action.',
    };
    return messages[code] || 'Something went wrong. Please try again.';
}
