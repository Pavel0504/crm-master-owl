/*
  # Add Logo to Shops Table

  1. Changes
    - Add `logo` column to `shops` table
      - Type: text (to store base64-encoded image data)
      - Nullable: yes (logo is optional)
      - Purpose: Allow users to upload and display their shop logo

  2. Notes
    - Logo will be stored as base64-encoded string
    - This allows for easy storage without external file management
    - Suitable for small to medium-sized logo images
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'logo'
  ) THEN
    ALTER TABLE shops ADD COLUMN logo text;
  END IF;
END $$;
