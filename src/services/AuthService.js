import { supabase } from '../lib/supabase'; // Adjust based on actual path

export const AuthService = {
    // 1. Sign In
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
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
                },
            },
        });
        if (error) throw error;

        // Profile is usually created via Trigger, but we can ensure it exists or update it here if needed
        return data;
    },

    // 3. Get User Profile
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
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
