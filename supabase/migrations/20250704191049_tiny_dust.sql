/*
  # Update User Permissions and RLS Policies

  1. Security Updates
    - Update RLS policies to respect user roles
    - Admins can do everything
    - Users can view and update jobs but not delete
    - Users cannot manage subcontractors

  2. Policy Changes
    - Update jobs table policies for role-based access
    - Update subcontractors table policies for admin-only management
    - Maintain public access for subcontractor portal
*/

-- Update jobs table policies for role-based access
DROP POLICY IF EXISTS "Admin can create jobs" ON jobs;
DROP POLICY IF EXISTS "Admin can delete jobs" ON jobs;

-- Allow both admins and users to create jobs
CREATE POLICY "Authenticated users can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'user')
    )
  );

-- Only admins can delete jobs
CREATE POLICY "Admin can delete jobs"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Update subcontractors policies - only admins can manage
DROP POLICY IF EXISTS "Admin can manage subcontractors" ON subcontractors;

CREATE POLICY "Admin can manage subcontractors"
  ON subcontractors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create a helper function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(role, 'user') 
  FROM profiles 
  WHERE id = user_id;
$$;

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated, anon;