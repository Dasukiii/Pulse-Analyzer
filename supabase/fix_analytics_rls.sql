-- =============================================
-- Fix RLS Policies for Themes and Narratives
-- Run this in your Supabase SQL Editor
-- =============================================

-- Drop existing restrictive policies for themes
DROP POLICY IF EXISTS "Allow managers to manage themes" ON themes;
DROP POLICY IF EXISTS "Allow authenticated users to manage themes" ON themes;

-- Create permissive policy for themes (any authenticated user)
CREATE POLICY "Allow authenticated users to manage themes" ON themes
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Drop existing restrictive policies for narratives  
DROP POLICY IF EXISTS "Allow managers to manage narratives" ON narratives;
DROP POLICY IF EXISTS "Allow authenticated users to manage narratives" ON narratives;

-- Create permissive policy for narratives (any authenticated user)
CREATE POLICY "Allow authenticated users to manage narratives" ON narratives
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also fix indicators policy if not already done
DROP POLICY IF EXISTS "Allow managers to manage indicators" ON indicators;
DROP POLICY IF EXISTS "Allow authenticated users to manage indicators" ON indicators;

CREATE POLICY "Allow authenticated users to manage indicators" ON indicators
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also fix heatmap_data policy if not already done
DROP POLICY IF EXISTS "Allow managers to manage heatmap" ON heatmap_data;
DROP POLICY IF EXISTS "Allow authenticated users to manage heatmap" ON heatmap_data;

CREATE POLICY "Allow authenticated users to manage heatmap" ON heatmap_data
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify the policies
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
