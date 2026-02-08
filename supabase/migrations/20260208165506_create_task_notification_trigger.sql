/*
  # Create Task Notification Trigger

  1. Changes
    - Create function to call edge function when task is assigned
    - Create trigger on tasks table for INSERT and UPDATE operations
    - Trigger fires when assigned_to field changes

  2. Security
    - Function runs with SECURITY DEFINER to allow webhook calls
    - Only triggers on actual assignment changes
*/

CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url text;
BEGIN
  webhook_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/task-notifications';
  
  IF (TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL) OR
     (TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL) THEN
    
    PERFORM net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'record', row_to_json(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS task_assignment_notification ON tasks;

CREATE TRIGGER task_assignment_notification
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assignment();
