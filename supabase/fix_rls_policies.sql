-- =============================================
-- FIX: Row Level Security Policies for Survey Upload
-- Run this in Supabase SQL Editor
-- =============================================

-- Option 1: Allow ALL authenticated users to create surveys (recommended for testing)
-- This is more permissive and allows any logged-in user to upload surveys

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow managers to manage surveys" ON surveys;
DROP POLICY IF EXISTS "Allow managers to manage questions" ON survey_questions;
DROP POLICY IF EXISTS "Allow managers to manage responses" ON survey_responses;
DROP POLICY IF EXISTS "Allow managers to manage answers" ON response_answers;
DROP POLICY IF EXISTS "Allow managers to manage themes" ON themes;
DROP POLICY IF EXISTS "Allow managers to manage narratives" ON narratives;
DROP POLICY IF EXISTS "Allow managers to manage indicators" ON indicators;
DROP POLICY IF EXISTS "Allow managers to manage heatmap" ON heatmap_data;

-- Create new policies that allow ALL authenticated users to insert/update

-- Surveys: Allow all authenticated users to manage
CREATE POLICY "Allow authenticated users to manage surveys" ON surveys
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Survey Questions: Allow all authenticated users
CREATE POLICY "Allow authenticated users to manage questions" ON survey_questions
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Survey Responses: Allow all authenticated users
CREATE POLICY "Allow authenticated users to manage responses" ON survey_responses
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Response Answers: Allow all authenticated users
CREATE POLICY "Allow authenticated users to manage answers" ON response_answers
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Themes: Allow all authenticated users
CREATE POLICY "Allow authenticated users to manage themes" ON themes
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Narratives: Allow all authenticated users
CREATE POLICY "Allow authenticated users to manage narratives" ON narratives
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Indicators: Allow all authenticated users
CREATE POLICY "Allow authenticated users to manage indicators" ON indicators
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Heatmap Data: Allow all authenticated users
CREATE POLICY "Allow authenticated users to manage heatmap" ON heatmap_data
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Departments: Allow authenticated users to insert new departments
DROP POLICY IF EXISTS "Allow authenticated read" ON departments;
CREATE POLICY "Allow authenticated users to manage departments" ON departments
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- =============================================
-- Option 2: Instead, you can upgrade the user to 'admin' role
-- Run this to make the demo user an admin:
-- =============================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'demotester@pulsetest.com';

-- Verify the changes
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
