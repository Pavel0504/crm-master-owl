/*
  # Add employee assignment to tasks

  1. Changes
    - Add `assigned_to` column to `tasks` table as optional foreign key to `profiles` table
    - Update RLS policies to allow assigned employees to view their assigned tasks
    - Add index for efficient employee assignment lookups

  2. Notes
    - Tasks can be assigned to employees (users in the profiles table)
    - When a task is assigned, the assigned employee can view it
    - The task creator always has full control
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE tasks ADD COLUMN assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;

CREATE POLICY "Users can view own or assigned tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR 
    auth.uid() IN (
      SELECT id FROM profiles WHERE id = tasks.assigned_to
    )
  );
