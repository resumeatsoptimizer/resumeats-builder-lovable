import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simulate loading time for the payment confirmation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">กำลังตรวจสอบการชำระเงิน...</h2>
            <p className="text-muted-foreground">กรุณารอสักครู่</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">ชำระเงินสำเร็จ!</CardTitle>
          <CardDescription className="text-base">
            เครดิตของคุณได้รับการเติมเรียบร้อยแล้ว
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionId && (
            <div className="text-sm text-muted-foreground">
              <p>เลขที่ธุรกรรม:</p>
              <p className="font-mono text-xs break-all">{sessionId}</p>
            </div>
          )}
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              ✅ เครดิตได้รับการเพิ่มในบัญชีของคุณแล้ว<br />
              ✅ คุณสามารถใช้ฟีเจอร์ AI ได้ทันที<br />
              ✅ ใบเสร็จจะส่งไปยังอีเมลของคุณ
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => navigate('/resume-editor')}
            >
              เริ่มสร้างเรซูเม่
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              กลับสู่หน้าหลัก
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;