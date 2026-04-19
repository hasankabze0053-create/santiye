-- Drop permissive read policies for construction_requests
DROP POLICY IF EXISTS "Authenticated users can view open requests" ON construction_requests;
DROP POLICY IF EXISTS "Contractors can view all pending/active requests" ON construction_requests;
DROP POLICY IF EXISTS "Assigned providers can view construction requests" ON construction_requests;

-- Add RLS policy for assigned providers to view their assigned construction_requests
CREATE POLICY "Assigned providers can view construction requests" ON construction_requests FOR SELECT USING (auth.uid() = ANY(assigned_provider_ids));

-- Drop permissive read policies for elevator_requests (if any are overly permissive)
DROP POLICY IF EXISTS "Assigned providers can view elevator requests" ON elevator_requests;

-- Add RLS policy for assigned providers to view their assigned elevator_requests
CREATE POLICY "Assigned providers can view elevator requests" ON elevator_requests FOR SELECT USING (auth.uid() = ANY(assigned_provider_ids));
