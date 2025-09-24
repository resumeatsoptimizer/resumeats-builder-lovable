import { FileCheck, Sparkles, BarChart3, Globe, Download, Monitor, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
const FeaturesSection = () => {
  const {
    t
  } = useLanguage();
  const features = [{
    icon: FileCheck,
    title: t('feature.atsReady.title'),
    description: t('feature.atsReady.desc')
  }, {
    icon: Sparkles,
    title: t('feature.aiPowered.title'),
    description: t('feature.aiPowered.desc')
  }, {
    icon: BarChart3,
    title: t('feature.match.title'),
    description: t('feature.match.desc')
  }, {
    icon: Globe,
    title: t('feature.translation.title'),
    description: t('feature.translation.desc')
  }, {
    icon: Monitor,
    title: t('feature.onlineResume.title'),
    description: t('feature.onlineResume.desc')
  }, {
    icon: Download,
    title: t('feature.instantDownload.title'),
    description: t('feature.instantDownload.desc')
  }, {
    icon: Send,
    title: t('feature.autoApply.title'),
    description: t('feature.autoApply.desc')
  }];
  return <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border bg-background">
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
              </Card>;
        })}
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 text-center">
          
        </div>
      </div>
    </section>;
};
export default FeaturesSection;