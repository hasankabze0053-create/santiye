-- Create elevator_requests table for Asansör Arıza Bakım requests
CREATE TABLE IF NOT EXISTS public.elevator_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    phone TEXT NOT NULL,
    fault_type TEXT DEFAULT 'Asansör Arıza Bakım',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.elevator_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own requests (or anonymous)
DROP POLICY IF EXISTS "Users can insert elevator requests" ON public.elevator_requests;
CREATE POLICY "Users can insert elevator requests"
ON public.elevator_requests FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can view their own requests
DROP POLICY IF EXISTS "Users can view own elevator requests" ON public.elevator_requests;
CREATE POLICY "Users can view own elevator requests"
ON public.elevator_requests FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all requests
DROP POLICY IF EXISTS "Admins can view all elevator requests" ON public.elevator_requests;
CREATE POLICY "Admins can view all elevator requests"
ON public.elevator_requests FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
