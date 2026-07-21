-- GC³ Portal Database Schema
-- Migration 028: Fix recursive RLS on profiles
-- Replaces recursive admin policies with SECURITY DEFINER function

-- Non-recursive function to get user role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = uid;
$$;

-- Non-recursive function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND role IN ('cpiu', 'leadership')
  );
$$;

-- ============================================================
-- PROFILES (non-recursive policies)
-- ============================================================

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow anon and authenticated to read profiles for auth verification
CREATE POLICY "Auth verification read access"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update all profiles (non-recursive via SECURITY DEFINER)
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));
