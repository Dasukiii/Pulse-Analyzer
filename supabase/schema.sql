-- =============================================
-- Pulse Analyzer Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE survey_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE question_type AS ENUM ('rating', 'text', 'multiple_choice');
CREATE TYPE sentiment_type AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE narrative_type AS ENUM ('summary', 'positive', 'concern', 'action');
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE trend_direction AS ENUM ('up', 'down', 'stable');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'viewer');

-- =============================================
-- TABLES
-- =============================================

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role user_role DEFAULT 'viewer',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surveys table
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    status survey_status DEFAULT 'draft',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    total_employees INTEGER NOT NULL DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    engagement_score NUMERIC(5,2),
    enps INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Survey Questions table
CREATE TABLE survey_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    question_category TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Responses table
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_email TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Response Answers table
CREATE TABLE response_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5),
    text_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-Detected Themes table
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    frequency INTEGER NOT NULL DEFAULT 0,
    sentiment sentiment_type NOT NULL,
    sentiment_score INTEGER NOT NULL CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
    keywords TEXT[] DEFAULT '{}',
    sample_quotes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Narrative Highlights table
CREATE TABLE narratives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    type narrative_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority priority_level DEFAULT 'medium',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key Indicators table
CREATE TABLE indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    current_value NUMERIC(10,2) NOT NULL,
    previous_value NUMERIC(10,2) DEFAULT 0,
    target_value NUMERIC(10,2) DEFAULT 0,
    trend trend_direction DEFAULT 'stable',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Heatmap Data table
CREATE TABLE heatmap_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(survey_id, department_id, question_id)
);

-- =============================================
-- INDEXES for better query performance
-- =============================================

CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_date ON surveys(date DESC);
CREATE INDEX idx_surveys_created_by ON surveys(created_by);
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_response_answers_response_id ON response_answers(response_id);
CREATE INDEX idx_themes_survey_id ON themes(survey_id);
CREATE INDEX idx_narratives_survey_id ON narratives(survey_id);
CREATE INDEX idx_narratives_type ON narratives(type);
CREATE INDEX idx_indicators_survey_id ON indicators(survey_id);
CREATE INDEX idx_heatmap_data_survey_id ON heatmap_data(survey_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE heatmap_data ENABLE ROW LEVEL SECURITY;

-- Departments: All authenticated users can read
CREATE POLICY "Allow authenticated read" ON departments
    FOR SELECT TO authenticated USING (true);

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Allow authenticated read profiles" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Surveys: All authenticated users can read, admins/managers can write
CREATE POLICY "Allow authenticated read surveys" ON surveys
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow managers to manage surveys" ON surveys
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Survey Questions: All authenticated users can read
CREATE POLICY "Allow authenticated read questions" ON survey_questions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow managers to manage questions" ON survey_questions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Survey Responses: All authenticated users can read
CREATE POLICY "Allow authenticated read responses" ON survey_responses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow managers to manage responses" ON survey_responses
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Response Answers: All authenticated users can read
CREATE POLICY "Allow authenticated read answers" ON response_answers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow managers to manage answers" ON response_answers
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Themes: All authenticated users can read
CREATE POLICY "Allow authenticated read themes" ON themes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow managers to manage themes" ON themes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Narratives: All authenticated users can read
CREATE POLICY "Allow authenticated read narratives" ON narratives
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow managers to manage narratives" ON narratives
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Indicators: All authenticated users can read
CREATE POLICY "Allow authenticated read indicators" ON indicators
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow managers to manage indicators" ON indicators
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Heatmap Data: All authenticated users can read
CREATE POLICY "Allow authenticated read heatmap" ON heatmap_data
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow managers to manage heatmap" ON heatmap_data
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update survey response count
CREATE OR REPLACE FUNCTION update_survey_response_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE surveys 
        SET response_count = response_count + 1 
        WHERE id = NEW.survey_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE surveys 
        SET response_count = response_count - 1 
        WHERE id = OLD.survey_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update response count
CREATE TRIGGER on_response_change
    AFTER INSERT OR DELETE ON survey_responses
    FOR EACH ROW EXECUTE FUNCTION update_survey_response_count();

-- Function to update profile timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile timestamp
CREATE TRIGGER on_profile_update
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SEED DATA (Sample departments)
-- =============================================

INSERT INTO departments (name) VALUES
    ('Engineering'),
    ('Product'),
    ('Design'),
    ('Marketing'),
    ('Sales'),
    ('Customer Success'),
    ('Human Resources'),
    ('Finance'),
    ('Operations');
