import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
interface QRCodeGeneratorProps {
  resumeId: string;
  resumeTitle?: string;
}
export const QRCodeGenerator = ({
  resumeId,
  resumeTitle = "My Resume"
}: QRCodeGeneratorProps) => {
  const {
    toast
  } = useToast();

  // Generate the public URL for the resume
  const resumeUrl = `${window.location.origin}/resume/${resumeId}`;
  const downloadQRCode = () => {
    try {
      const svg = document.getElementById('qr-code-svg');
      if (!svg) return;

      // Convert SVG to canvas and download
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-code-${resumeTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      toast({
        title: "Success",
        description: "QR code downloaded successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive"
      });
    }
  };
  const shareQRCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resumeTitle,
          text: `Check out my resume: ${resumeTitle}`,
          url: resumeUrl
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(resumeUrl);
        toast({
          title: "Success",
          description: "Resume URL copied to clipboard!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share resume. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-lg">Share Your Resume</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border">
            <QRCodeSVG id="qr-code-svg" value={resumeUrl} size={200} level="M" includeMargin={true} fgColor="#374151" bgColor="#ffffff" />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Scan to view resume online
          </p>
          <p className="text-xs text-muted-foreground break-all">
            {resumeUrl}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadQRCode} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={shareQRCode} className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>;
};