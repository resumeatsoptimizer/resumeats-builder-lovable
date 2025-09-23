import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ResumeTemplate } from '@/components/ResumeTemplate';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';

const ResumePublic = () => {
  const { id } = useParams<{ id: string }>();
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!id) {
        setError('Invalid resume ID');
        setLoading(false);
        return;
      }

      try {
        // For public viewing, we need to temporarily disable RLS or create a public policy
        // For now, this will work only if the user is logged in or has public access
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching resume:', error);
          setError('Resume not found or not accessible');
          return;
        }

        setResumeData(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resume Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resume Not Available</h1>
          <p className="text-muted-foreground">This resume is not available for public viewing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <ResumeTemplate 
            data={resumeData.resume_data} 
            layout={resumeData.template_name} 
          />
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Powered by ResumeATS-Builder
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ResumePublic;