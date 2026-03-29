-- 1. Enum Update (Add urban_transformation if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'service_type_enum' AND e.enumlabel = 'urban_transformation') THEN 
        ALTER TYPE service_type_enum ADD VALUE 'urban_transformation'; 
    END IF; 
END $$;

-- 2. Ensure all types are consistent with user request naming (if needed)
-- (The existing types are: market_seller, machine_renter, contractor, technical_office, lawyer, renovation_office, logistics_company)
-- User wants: kentsel dönüşüm, tadilat ofisi, market satış, lojistik, iş makinesi kiralama, avukatlık hukuki destek, teknik ofis.
-- Mapping matches well.

-- 3. Create a helper function to check module access
CREATE OR REPLACE FUNCTION check_user_module_access(p_user_id UUID, p_service_type service_type_enum)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN;
BEGIN
    -- Admin override
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_admin = true) THEN
        RETURN true;
    END IF;

    -- Check if company has active service
    SELECT EXISTS (
        SELECT 1 
        FROM public.company_services cs
        JOIN public.companies c ON cs.company_id = c.id
        WHERE c.owner_id = p_user_id 
          AND cs.service_type = p_service_type 
          AND cs.status = 'active'
    ) INTO v_has_access;

    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
