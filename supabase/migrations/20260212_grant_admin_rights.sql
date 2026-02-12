-- Grant full access to mkorayzengin@gmail.com
UPDATE public.profiles
SET 
    is_admin = true,
    is_contractor = true,
    is_lawyer = true,
    is_transporter = true,
    is_seller = true,
    is_engineer = true,
    is_architect = true
WHERE email = 'mkorayzengin@gmail.com';
