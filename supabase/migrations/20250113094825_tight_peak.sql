/*
  # Create videos table for YouTube summaries

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `url` (text, not null) - YouTube video URL
      - `summary` (text) - Generated summary of the video
      - `user_id` (uuid, not null) - Reference to auth.users
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `videos` table
    - Add policies for:
      - Users can read their own videos
      - Users can insert their own videos
      - Users can update their own videos
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  summary text,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX videos_user_id_idx ON videos(user_id);
CREATE INDEX videos_created_at_idx ON videos(created_at);