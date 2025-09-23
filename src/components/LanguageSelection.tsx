import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import WarningPopup from '@/components/WarningPopup';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface LanguageSelectionProps {
  resumeData: any;
  onResumeUpdate: (updatedData: any) => void;
}
const SUPPORTED_LANGUAGES = ['ไทย', 'อังกฤษ', 'จีน (Mandarin)', 'ญี่ปุ่น', 'เกาหลี', 'เยอรมัน', 'ฝรั่งเศส', 'รัสเซีย', 'อิตาลี', 'สเปน', 'โปรตุเกส', 'อาหรับ'];
const LanguageSelection: React.FC<LanguageSelectionProps> = ({
  resumeData,
  onResumeUpdate
}) => {
  const {
    toast
  } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showWarning, setShowWarning] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const handleTranslateClick = () => {
    if (!selectedLanguage) {
      toast({
        title: "เลือกภาษา",
        description: "กรุณาเลือกภาษาที่ต้องการแปลก่อน",
        variant: "destructive"
      });
      return;
    }
    setShowWarning(true);
  };
  const handleTranslationConfirm = async () => {
    setShowWarning(false);
    setIsTranslating(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "กรุณาเข้าสู่ระบบก่อนใช้งาน",
          variant: "destructive"
        });
        return;
      }
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-translate', {
        body: {
          resumeData,
          targetLanguage: selectedLanguage
        }
      });
      if (error) {
        console.error('Translation error:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message || "ไม่สามารถแปลเรซูเม่ได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive"
        });
        return;
      }
      if (data?.translatedData) {
        onResumeUpdate(data.translatedData);
        toast({
          title: "แปลสำเร็จ",
          description: `แปลเรซูเม่เป็น${selectedLanguage}เรียบร้อยแล้ว เครดิตคงเหลือ: ${data.remainingCredits}`
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแปลเรซูเม่ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };
  return <>
      <Card>
        
        
      </Card>

      <WarningPopup isOpen={showWarning} onClose={() => setShowWarning(false)} onConfirm={handleTranslationConfirm} title="คำเตือน" message="การแปลด้วย AI อาจไม่ถูกต้อง 100% และควรใช้เพื่อการอ้างอิงเท่านั้น การยื่นเรซูเม่ที่เป็นเท็จอาจส่งผลเสียต่อการสมัครงานของคุณ ยืนยันเพื่อดำเนินการต่อและใช้ 5 เครดิตหรือไม่?" confirmText="ยืนยัน" cancelText="ยกเลิก" />
    </>;
};
export default LanguageSelection;