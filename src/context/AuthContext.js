
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthService } from '../services/AuthService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check active session
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                console.log("AuthContext: Session found?", !!session);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    console.log("AuthContext: Fetching profile for", session.user.id);
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error("Auth init error:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthContext: Auth Change Event:", event);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                console.log("AuthContext: User ID:", session.user.id);
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            console.log("AuthContext: calling AuthService.getProfile...");
            const data = await AuthService.getProfile(userId);
            console.log("AuthContext: Profile data received:", data);

            // If still null after fetch, we might need to rely on AuthService to create it,
            // but for now we just set what we have.
            setProfile(data);
        } catch (error) {
            console.warn("AuthContext: Fetch profile warning (non-fatal):", error.message);
        }
    };

    const signOut = async () => {
        await AuthService.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            loading,
            signOut,
            isAdmin: profile?.user_type === 'admin', // Future proofing
            isCorporate: profile?.user_type === 'corporate',
            refreshProfile: () => user && fetchProfile(user.id)
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
