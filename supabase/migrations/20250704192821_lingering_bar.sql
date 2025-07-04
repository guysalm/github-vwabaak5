/*
  # Create user account function for admin user creation

  1. New Functions
    - `create_user_account` - Secure function for creating user accounts
    - Validates admin permissions
    - Creates both auth user and profile entry
    - Handles errors gracefully

  2. Security
    - Only admins can create user accounts
    - Proper error handling and validation
    - Secure user creation process
*/

-- Create function to create user accounts (admin only)
CREATE OR REPLACE FUNCTION create_user_account(
  user_email text,
  user_password text,
  user_full_name text DEFAULT '',
  user_role text DEFAULT 'user'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_current_user_role text;
  v_new_user_id uuid;
  v_auth_user_data json;
BEGIN
  -- Get current user
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  -- Check if current user is admin
  SELECT role INTO v_current_user_role
  FROM profiles 
  WHERE id = v_current_user_id;
  
  IF v_current_user_role != 'admin' THEN
    RETURN json_build_object('success', false, 'message', 'Only admins can create user accounts');
  END IF;
  
  -- Validate inputs
  IF user_email IS NULL OR user_email = '' THEN
    RETURN json_build_object('success', false, 'message', 'Email is required');
  END IF;
  
  IF user_password IS NULL OR length(user_password) < 8 THEN
    RETURN json_build_object('success', false, 'message', 'Password must be at least 8 characters');
  END IF;
  
  IF user_role NOT IN ('admin', 'user') THEN
    RETURN json_build_object('success', false, 'message', 'Role must be either admin or user');
  END IF;
  
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN json_build_object('success', false, 'message', 'User with this email already exists');
  END IF;
  
  -- Generate new user ID
  v_new_user_id := gen_random_uuid();
  
  -- Create the user in auth.users (this requires service role privileges)
  -- Note: This function needs to be called with elevated privileges
  BEGIN
    -- Insert into auth.users table directly (requires service role)
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      v_new_user_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      user_email,
      crypt(user_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      json_build_object('full_name', user_full_name, 'role', user_role),
      false,
      'authenticated'
    );
    
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Failed to create auth user: ' || SQLERRM
    );
  END;
  
  -- Create profile entry
  BEGIN
    INSERT INTO profiles (
      id,
      email,
      full_name,
      role,
      created_at,
      updated_at
    ) VALUES (
      v_new_user_id,
      user_email,
      user_full_name,
      user_role,
      now(),
      now()
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- If profile creation fails, clean up the auth user
    DELETE FROM auth.users WHERE id = v_new_user_id;
    RETURN json_build_object(
      'success', false, 
      'message', 'Failed to create user profile: ' || SQLERRM
    );
  END;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User created successfully',
    'user_id', v_new_user_id,
    'email', user_email,
    'role', user_role
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', 'Unexpected error: ' || SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users (function handles admin check internally)
GRANT EXECUTE ON FUNCTION create_user_account(text, text, text, text) TO authenticated;

-- Create a simpler fallback function for basic user creation
CREATE OR REPLACE FUNCTION create_basic_user(
  user_email text,
  user_password text,
  user_full_name text DEFAULT '',
  user_role text DEFAULT 'user'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_current_user_role text;
BEGIN
  -- Get current user
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  -- Check if current user is admin
  SELECT role INTO v_current_user_role
  FROM profiles 
  WHERE id = v_current_user_id;
  
  IF v_current_user_role != 'admin' THEN
    RETURN json_build_object('success', false, 'message', 'Only admins can create user accounts');
  END IF;
  
  -- This is a placeholder that returns instructions for manual creation
  RETURN json_build_object(
    'success', false,
    'message', 'Please use the Supabase dashboard to create users, then assign roles here',
    'instructions', 'Go to Authentication > Users in Supabase dashboard to create the user account'
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_basic_user(text, text, text, text) TO authenticated;