import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import Pricing from "@/pages/Pricing";
import { useLanguage } from "@/contexts/LanguageContext";

const ATSSection = () => {
  const { t } = useLanguage();
  
  return (
    <section id="about" className="py-20 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            {t('ats.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
            {t('ats.subtitle')}
          </p>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            {t('ats.description')}
          </p>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ATSSection />
        <FeaturesSection />
        <div className="py-20">
          <Pricing />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
