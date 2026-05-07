-- Add subscription tracking columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create an index for expiry dates to help with filtering/reporting later
CREATE INDEX IF NOT EXISTS idx_companies_subscription_expiry ON public.companies(subscription_expires_at);

COMMENT ON COLUMN public.companies.subscription_start_date IS 'The date when the corporate subscription was first activated.';
COMMENT ON COLUMN public.companies.subscription_expires_at IS 'The date when the corporate subscription will expire.';
