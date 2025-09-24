import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WordGeneratorProps {
  resumeId: string;
  resumeTitle?: string;
}

export const WordGenerator = ({ resumeId, resumeTitle = "Resume" }: WordGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateWord = async () => {
    setIsGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Prepare request headers - include auth if available
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-word', {
        body: { resume_id: resumeId },
        headers,
      });

      if (error) {
        throw error;
      }

      if (data?.wordBlob) {
        // Create a blob from the base64 data and download it
        const byteCharacters = atob(data.wordBlob);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Word Document Ready",
          description: "Your resume has been downloaded as a Word document.",
        });
      } else {
        throw new Error('No Word document content received');
      }

    } catch (error) {
      console.error('Error generating Word document:', error);
      toast({
        title: "Error",
        description: "Failed to generate Word document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateWord} 
      disabled={isGenerating}
      className="w-full"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {isGenerating ? 'Generating Word...' : 'Download Word'}
    </Button>
  );
};