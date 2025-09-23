import { FileCheck, Sparkles, BarChart3, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FeaturesSection = () => {
  const features = [
    {
      icon: FileCheck,
      title: "ATS-Friendly Templates",
      description: "เลือกเทมเพลตที่ออกแบบมาเพื่อผ่านระบบคัดกรองอัตโนมัติโดยเฉพาะ",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Enhancement",
      description: "อัปเกรดเนื้อหาเรซูเม่ของคุณให้โดดเด่นด้วยพลังของ AI",
    },
    {
      icon: BarChart3,
      title: "Job Match Analysis",
      description: "วิเคราะห์ความเข้ากันของเรซูเม่กับตำแหน่งงานที่คุณสนใจ",
    },
    {
      icon: Globe,
      title: "AI Translation",
      description: "แปลเรซูเม่ของคุณเป็นภาษาต่างๆ ทั่วโลก เพื่อโอกาสที่ไร้พรมแดน",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            ฟีเจอร์เด็ดที่จะทำให้เรซูเม่คุณโดดเด่น
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            เครื่องมือครบครันที่ช่วยให้คุณสร้างเรซูเม่ที่ผ่านระบบ ATS และสร้างความประทับใจให้กับผู้รับสมัครงาน
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border bg-background">
                <CardContent className="p-8 text-center">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6 group-hover:bg-primary/15 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground">เทมเพลต ATS</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">90%</div>
              <div className="text-sm text-muted-foreground">อัตราผ่าน ATS</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">5 นาที</div>
              <div className="text-sm text-muted-foreground">สร้างเรซูเม่</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">ความช่วยเหลือ AI</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;