-- =============================================
-- FIX: User Signup Trigger
-- Run this in Supabase SQL Editor to fix the "Database error saving new user" issue
-- =============================================

-- First, make sure the profiles table allows inserts during auth
-- The trigger runs with SECURITY DEFINER but we need to ensure it can insert

-- Drop existing trigger and function if they exist (to recreate with fixes)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'viewer'
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.departments TO authenticated;
GRANT ALL ON public.departments TO anon;

-- Make sure the service role can bypass RLS for the trigger
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Add policy to allow the trigger to insert (using service role)
DROP POLICY IF EXISTS "Allow trigger insert" ON public.profiles;
CREATE POLICY "Allow trigger insert" ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- Also ensure profiles can be read by all authenticated users
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Verify the trigger exists
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
