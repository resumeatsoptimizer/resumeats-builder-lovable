import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentCanceled: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl text-yellow-600">การชำระเงินถูกยกเลิก</CardTitle>
          <CardDescription className="text-base">
            คุณได้ยกเลิกการชำระเงินในขั้นตอนสุดท้าย
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              💡 ไม่มีการหักเงินจากบัญชีของคุณ<br />
              💡 คุณสามารถลองซื้อเครดิตใหม่ได้ตุกเวลา<br />
              💡 หากมีปัญหาติดต่อเราได้ทันที
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => navigate('/pricing')}
            >
              เลือกแพ็กเกจใหม่
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              กลับสู่หน้าหลัก
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>หากคุณพบปัญหาในการชำระเงิน</p>
            <p>กรุณาติดต่อทีมสนับสนุนของเรา</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCanceled;