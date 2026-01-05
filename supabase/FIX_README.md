# Theme Generation Fix

## Problem

Theme generation is failing because the database Row Level Security (RLS) policies are too restrictive. The original policies only allow users with 'admin' or 'manager' roles to create themes, but new users get a 'viewer' role by default.

## Solution

Apply the updated RLS policies that allow authenticated users to manage data for their own surveys.

## How to Fix

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run the Fix**
   - Click "New query"
   - Open the file `supabase/APPLY_THIS_FIX.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify**
   - The query should complete successfully
   - At the bottom, you'll see a table showing all the new policies
   - Try generating themes again - it should now work

## What This Does

The fix updates RLS policies to use **user isolation** instead of role-based access:

- **Before**: Only 'admin' and 'manager' roles could save themes
- **After**: Any authenticated user can save themes for surveys they created

This ensures:
- Users can only see their own surveys and data
- Theme generation works for all authenticated users
- Data remains secure and isolated between users

## Alternative Quick Fix

If you prefer to use the role-based approach, you can instead upgrade your user role to 'admin':

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email address.

However, the user isolation approach (using APPLY_THIS_FIX.sql) is recommended as it provides better security and scalability.
