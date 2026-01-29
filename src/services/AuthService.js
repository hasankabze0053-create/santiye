import { supabase } from '../lib/supabase'; // Adjust based on actual path

export const AuthService = {
    // 1. Sign In
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;

        // Self-Healing: Ensure profile exists
        if (data.session?.user) {
            await this.ensureProfile(data.session.user);
        }

        return data;
    },

    // 2. Sign Up
    async signUp(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    avatar_url: '',
                    user_type: 'individual' // Explicitly set meta
                },
            },
        });
        if (error) throw error;

        // If session exists immediately (no email confirm required), ensure profile
        if (data.session?.user) {
            await this.ensureProfile(data.session.user);
        }

        return data;
    },

    // 3. Get User Profile
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    // NEW: Self-Healing Profile Creation
    async ensureProfile(user) {
        try {
            // Check if profile exists
            let { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (!profile) {
                console.log("AuthService: Profile missing, creating manually...");
                // Create profile manually since trigger failed or hasn't run
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || '',
                        user_type: 'individual', // Default fallback
                        avatar_url: ''
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error("AuthService: Failed to create profile manually:", createError);
                } else {
                    console.log("AuthService: Profile created manually.");
                }
            }
        } catch (e) {
            console.error("AuthService: ensureProfile exception:", e);
        }
    },

    // 4. Update Profile (e.g. User Type)
    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 5. Register Company
    async registerCompany(companyData, serviceTypes) {
        // A. Create Company
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
                owner_id: companyData.owner_id,
                company_name: companyData.company_name,
                tax_number: companyData.tax_number,
                tax_office: companyData.tax_office,
                phone: companyData.phone,
                address: companyData.address,
            })
            .select()
            .single();

        if (companyError) throw companyError;

        // B. Add Services
        const servicesToInsert = serviceTypes.map(type => ({
            company_id: company.id,
            service_type: type,
            status: 'pending' // Default to pending
        }));

        const { error: servicesError } = await supabase
            .from('company_services')
            .insert(servicesToInsert);

        if (servicesError) throw servicesError;

        return company;
    },

    // 6. Sign Out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
};
