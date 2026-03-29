import { supabase } from '../lib/supabase';

export const PermissionService = {
    // 1. Fetch all active permissions for the user's company
    async getActivePermissions() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    is_admin,
                    companies!companies_owner_id_fkey (
                        id,
                        company_services (
                            service_type,
                            status
                        )
                    )
                `)
                .eq('id', user.id)
                .single();

            if (error) {
                console.error("PermissionService: Error fetching permissions:", error.message);
                return [];
            }

            // Admins get "root" access - we return a special key or all possible
            if (data.is_admin) {
                return ['admin_all'];
            }

            // Extract active services
            const activeServices = data.companies?.[0]?.company_services
                ?.filter(s => s.status === 'active')
                ?.map(s => s.service_type) || [];

            return activeServices;
        } catch (e) {
            console.error("PermissionService: Exception:", e);
            return [];
        }
    },

    // 2. Generic Access Check (Reusable across screens)
    async checkAccess(serviceType) {
        try {
            const permissions = await this.getActivePermissions();
            
            // Admin override
            if (permissions.includes('admin_all')) return true;

            // Specific service check
            return permissions.includes(serviceType);
        } catch (e) {
            console.warn("PermissionService: Check access failed:", e);
            return false;
        }
    },

    // 3. User Detail Check (for Admin status etc)
    async getUserRoles() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { isAdmin: false };

        const { data } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
        
        return {
            isAdmin: data?.is_admin || false
        };
    }
};
