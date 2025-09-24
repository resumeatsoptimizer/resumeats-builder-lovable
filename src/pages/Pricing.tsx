import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const Pricing: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const creditPackages = [
    {
      name: t('pricing.basic'),
      price: '฿99',
      credits: 25,
      priceId: 'price_1SATkMCfUrZVjQTC4lbDFaBg',
      features: [
        `25 ${t('feature.aiPowered.title')} uses`,
        `12 ${t('feature.match.title')}`,
        `8 ${t('feature.translation.title')}`,
        t('pricing.features.validMonths').replace('{months}', '6')
      ]
    },
    {
      name: t('pricing.premium'),
      price: '฿199',
      credits: 75,
      priceId: 'price_1SATl1CfUrZVjQTCXz7crofs',
      popular: true,
      features: [
        `75 ${t('feature.aiPowered.title')} uses`,
        `37 ${t('feature.match.title')}`,
        `25 ${t('feature.translation.title')}`,
        t('pricing.features.validMonths').replace('{months}', '12'),
        t('pricing.features.bestValue')
      ]
    }
  ];

  const handlePurchase = async (priceId: string, packageName: string) => {
    try {
      setLoading(priceId);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase credits.",
          variant: "destructive",
        });
        return;
      }

      // Call the create-checkout-session function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: priceId,
          quantity: 1
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : 'Failed to create checkout session',
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">{t('pricing.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {creditPackages.map((pkg) => (
          <Card key={pkg.priceId} className={`relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
            {pkg.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                {t('pricing.popular')}
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-primary">{pkg.price}</span>
                <span className="text-muted-foreground ml-1">/ {pkg.credits} {t('common.credits')}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handlePurchase(pkg.priceId, pkg.name)}
                disabled={loading === pkg.priceId}
                variant={pkg.popular ? "default" : "outline"}
              >
                {loading === pkg.priceId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  `${t('pricing.getStarted')} ${pkg.credits} ${t('common.credits')}`
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">{t('pricing.creditUsage')}</h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium">{t('pricing.enhancement')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('pricing.enhancementCredit')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium">{t('feature.match.title')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('pricing.jobMatchCredit')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium">{t('feature.translation.title')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('pricing.translationCredit')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Pricing;
