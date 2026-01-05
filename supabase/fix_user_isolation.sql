-- =============================================
-- FIX USER ISOLATION RLS POLICIES
-- This ensures users can ONLY see their own surveys and related data
-- Run this in your Supabase SQL Editor
-- =============================================

-- =============================================
-- SURVEYS TABLE - Core isolation
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage surveys" ON surveys;
DROP POLICY IF EXISTS "Users can only see their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can only insert their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can only update their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can only delete their own surveys" ON surveys;

-- Enable RLS on surveys table
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only see surveys they created
CREATE POLICY "Users can only see their own surveys" ON surveys
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

-- INSERT: Users can only insert surveys with their own user ID
CREATE POLICY "Users can only insert their own surveys" ON surveys
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- UPDATE: Users can only update their own surveys
CREATE POLICY "Users can only update their own surveys" ON surveys
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- DELETE: Users can only delete their own surveys
CREATE POLICY "Users can only delete their own surveys" ON surveys
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- =============================================
-- THEMES TABLE - Linked to surveys
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to manage themes" ON themes;
DROP POLICY IF EXISTS "Users can only see themes for their surveys" ON themes;
DROP POLICY IF EXISTS "Users can only manage themes for their surveys" ON themes;

ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage themes for surveys they own
CREATE POLICY "Users can only manage themes for their surveys" ON themes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = themes.survey_id 
            AND surveys.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = themes.survey_id 
            AND surveys.created_by = auth.uid()
        )
    );

-- =============================================
-- NARRATIVES TABLE - Linked to surveys
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to manage narratives" ON narratives;
DROP POLICY IF EXISTS "Users can only manage narratives for their surveys" ON narratives;

ALTER TABLE narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage narratives for their surveys" ON narratives
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = narratives.survey_id 
            AND surveys.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = narratives.survey_id 
            AND surveys.created_by = auth.uid()
        )
    );

-- =============================================
-- INDICATORS TABLE - Linked to surveys
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to manage indicators" ON indicators;
DROP POLICY IF EXISTS "Users can only manage indicators for their surveys" ON indicators;

ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage indicators for their surveys" ON indicators
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = indicators.survey_id 
            AND surveys.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = indicators.survey_id 
            AND surveys.created_by = auth.uid()
        )
    );

-- =============================================
-- HEATMAP_DATA TABLE - Linked to surveys
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to manage heatmap" ON heatmap_data;
DROP POLICY IF EXISTS "Users can only manage heatmap for their surveys" ON heatmap_data;

ALTER TABLE heatmap_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage heatmap for their surveys" ON heatmap_data
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = heatmap_data.survey_id 
            AND surveys.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = heatmap_data.survey_id 
            AND surveys.created_by = auth.uid()
        )
    );

-- =============================================
-- SURVEY_RESPONSES TABLE - Linked to surveys
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to insert responses" ON survey_responses;
DROP POLICY IF EXISTS "Users can only manage responses for their surveys" ON survey_responses;

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage responses for their surveys" ON survey_responses
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = survey_responses.survey_id 
            AND surveys.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = survey_responses.survey_id 
            AND surveys.created_by = auth.uid()
        )
    );

-- =============================================
-- RESPONSE_ANSWERS TABLE - Linked through responses
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to insert answers" ON response_answers;
DROP POLICY IF EXISTS "Users can only manage answers for their surveys" ON response_answers;

ALTER TABLE response_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage answers for their surveys" ON response_answers
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM survey_responses 
            JOIN surveys ON surveys.id = survey_responses.survey_id
            WHERE survey_responses.id = response_answers.response_id 
            AND surveys.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM survey_responses 
            JOIN surveys ON surveys.id = survey_responses.survey_id
            WHERE survey_responses.id = response_answers.response_id 
            AND surveys.created_by = auth.uid()
        )
    );

-- =============================================
-- SURVEY_QUESTIONS TABLE - Linked to surveys
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to insert questions" ON survey_questions;
DROP POLICY IF EXISTS "Users can only manage questions for their surveys" ON survey_questions;

ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage questions for their surveys" ON survey_questions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = survey_questions.survey_id 
            AND surveys.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = survey_questions.survey_id 
            AND surveys.created_by = auth.uid()
        )
    );

-- =============================================
-- DEPARTMENTS TABLE - Shared across users (read-only for all)
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to manage departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can read departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can create departments" ON departments;

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read departments
CREATE POLICY "Authenticated users can read departments" ON departments
    FOR SELECT TO authenticated
    USING (true);

-- All authenticated users can create departments
CREATE POLICY "Authenticated users can create departments" ON departments
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- =============================================
-- Verify the policies
-- =============================================
SELECT tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
