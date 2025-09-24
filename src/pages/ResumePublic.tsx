import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ResumeTemplate } from '@/components/ResumeTemplate';
import { WordGenerator } from '@/components/WordGenerator';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        console.log('Fetching resume with ID:', id);
        
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', id)
          .eq('is_public', true)
          .maybeSingle();

        console.log('Query result:', { data, error });

        if (error) {
          console.error('Error fetching resume:', error);
          setError(`Database error: ${error.message}`);
          return;
        }

        if (!data) {
          console.log('No resume found with ID:', id, 'that is public');
          setError('Resume not found or not public');
          return;
        }

        console.log('Resume found:', data);
        setResumeData(data);
      } catch (err) {
        console.error('Unexpected error:', err);
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
          {/* Back to Dashboard Button */}
          <div className="max-w-4xl mx-auto mb-6">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                กลับสู่หน้าแรก
              </Button>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <ResumeTemplate 
              data={resumeData.resume_data} 
              template={resumeData.template_name} 
              themeColor={resumeData.theme_color || '#3b82f6'}
            />
          </div>
          
          {/* PDF and QR Code Section */}
          <div className="max-w-4xl mx-auto mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WordGenerator resumeId={id || ''} resumeTitle={resumeData.resume_data?.personalInfo?.fullName || 'Resume'} />
              <QRCodeGenerator resumeId={id || ''} resumeTitle={resumeData.resume_data?.personalInfo?.fullName || 'Resume'} />
            </div>
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