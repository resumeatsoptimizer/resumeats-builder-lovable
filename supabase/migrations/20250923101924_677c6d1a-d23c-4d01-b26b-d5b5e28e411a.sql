-- Add a column to track if a resume should be publicly accessible
ALTER TABLE public.resumes ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Create a policy to allow public access to resumes marked as public
CREATE POLICY "Public resumes are viewable by everyone" 
ON public.resumes 
FOR SELECT 
USING (is_public = true);

-- Create index for better performance on public resume queries
CREATE INDEX idx_resumes_public ON public.resumes(is_public) WHERE is_public = true;