import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Eye, TrendingUp } from "lucide-react";
const ATSSection = () => {
  const {
    t
  } = useLanguage();
  return <section id="about" className="bg-muted/30 my-0 py-[101px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            {t('ats.title')}
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('ats.subtitle')}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('ats.description')}
            </p>
          </div>
        </div>

        {/* Visual representation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">100% ATS Compatible</h3>
            <p className="text-muted-foreground">Designed to pass through all ATS systems</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Full Visibility</h3>
            <p className="text-muted-foreground">Ensure HR sees all your information</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Higher Success Rate</h3>
            <p className="text-muted-foreground">Increase your chances of getting noticed</p>
          </div>
        </div>
      </div>
    </section>;
};
export default ATSSection;