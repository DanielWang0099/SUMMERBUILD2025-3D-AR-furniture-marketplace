-- Hackathon mode: Disable RLS for development
-- Run this in your Supabase SQL editor

-- First, get a list of all tables and disable RLS on each one
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', table_record.tablename);
        RAISE NOTICE 'Disabled RLS on table: %', table_record.tablename;
    END LOOP;
END $$;

-- If you have specific tables that need RLS disabled, also list them explicitly
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE furniture DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE model_generation_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE ar_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                      policy_record.policyname, 
                      policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on table: %', 
                    policy_record.policyname, 
                    policy_record.tablename;
    END LOOP;
END $$;

-- Grant public access for hackathon mode (for both anon and authenticated roles)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON SCHEMA public TO anon, authenticated;

-- Grant usage on all types
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Allow access to the custom types
GRANT USAGE ON TYPE furniture_status TO anon;
GRANT USAGE ON TYPE media_type TO anon;
GRANT USAGE ON TYPE job_status TO anon;
GRANT USAGE ON TYPE order_status TO anon;
GRANT USAGE ON TYPE interaction_type TO anon;
