-- Row Level Security Policies for Life OS
-- Run this AFTER creating tables in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredient_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- HELPER FUNCTION FOR ALL TABLES
-- ============================================

-- Create policies for a table (run for each table)
-- Example: SELECT create_rls_policies('logs');

CREATE OR REPLACE FUNCTION create_rls_policies(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- SELECT: Users can only see their own data
  EXECUTE format('
    CREATE POLICY "Users can view own %I"
    ON %I FOR SELECT
    USING (auth.uid() = user_id)
  ', table_name, table_name);
  
  -- INSERT: Users can only insert their own data
  EXECUTE format('
    CREATE POLICY "Users can insert own %I"
    ON %I FOR INSERT
    WITH CHECK (auth.uid() = user_id)
  ', table_name, table_name);
  
  -- UPDATE: Users can only update their own data
  EXECUTE format('
    CREATE POLICY "Users can update own %I"
    ON %I FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)
  ', table_name, table_name);
  
  -- DELETE: Users can only delete their own data
  EXECUTE format('
    CREATE POLICY "Users can delete own %I"
    ON %I FOR DELETE
    USING (auth.uid() = user_id)
  ', table_name, table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- APPLY RLS POLICIES TO ALL TABLES
-- ============================================

SELECT create_rls_policies('logs');
SELECT create_rls_policies('items');
SELECT create_rls_policies('content');
SELECT create_rls_policies('goals');
SELECT create_rls_policies('habits');
SELECT create_rls_policies('habit_logs');
SELECT create_rls_policies('streaks');
SELECT create_rls_policies('sleep_logs');
SELECT create_rls_policies('water_logs');
SELECT create_rls_policies('mood_logs');
SELECT create_rls_policies('body_measurements');
SELECT create_rls_policies('reminders');
SELECT create_rls_policies('reminder_logs');
SELECT create_rls_policies('templates');
SELECT create_rls_policies('books');
SELECT create_rls_policies('user_books');
SELECT create_rls_policies('authors');
SELECT create_rls_policies('book_authors');
SELECT create_rls_policies('series');
SELECT create_rls_policies('genres');
SELECT create_rls_policies('book_genres');
SELECT create_rls_policies('book_quotes');
SELECT create_rls_policies('book_reviews');
SELECT create_rls_policies('recipe_ingredients');
SELECT create_rls_policies('recipe_ingredient_items');
SELECT create_rls_policies('recipe_steps');
SELECT create_rls_policies('categories');
SELECT create_rls_policies('units');
SELECT create_rls_policies('accounts');
SELECT create_rls_policies('sync_status');

-- ============================================
-- AUTH TRIGGER: Auto-create user profile
-- ============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();