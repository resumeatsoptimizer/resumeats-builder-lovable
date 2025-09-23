import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PDFGeneratorProps {
  resumeId: string;
  resumeTitle?: string;
}

export const PDFGenerator = ({ resumeId, resumeTitle = "Resume" }: PDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to download your resume as PDF",
          variant: "destructive"
        });
        return;
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { resume_id: resumeId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.html) {
        // For now, open the HTML in a new window for printing
        // In production, this would be actual PDF generation
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          
          // Auto-trigger print dialog
          printWindow.onload = () => {
            printWindow.print();
          };
          
          toast({
            title: "PDF Ready",
            description: "Print dialog opened. You can save as PDF from the print options.",
          });
        }
      } else {
        throw new Error('No HTML content received');
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      disabled={isGenerating}
      className="w-full"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {isGenerating ? 'Generating PDF...' : 'Download PDF'}
    </Button>
  );
};