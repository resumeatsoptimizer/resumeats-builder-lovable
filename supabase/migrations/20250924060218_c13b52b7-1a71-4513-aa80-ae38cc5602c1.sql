-- Add theme_color column to resumes table to store color theme for each resume
ALTER TABLE public.resumes 
ADD COLUMN theme_color TEXT DEFAULT '#3b82f6';