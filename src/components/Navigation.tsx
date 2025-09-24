import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
const Navigation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isLandingPage = location.pathname === '/';
  const toggleMenu = () => setIsOpen(!isOpen);
  useEffect(() => {
    // Check authentication status and fetch credits
    const checkAuthAndFetchCredits = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      console.log('Navigation - Current user:', user);
      if (user) {
        setIsAuthenticated(true);

        // Fetch user credits
        const {
          data: profile,
          error
        } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
        console.log('Navigation - Profile data:', profile, 'Error:', error);
        if (profile) {
          setUserCredits(profile.credits);
          console.log('Navigation - Set credits to:', profile.credits);
        }
      } else {
        setIsAuthenticated(false);
        setUserCredits(null);
        console.log('Navigation - No user, cleared credits');
      }
    };
    checkAuthAndFetchCredits();

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Navigation - Auth state change:', event, session?.user?.id);
      if (session?.user) {
        setIsAuthenticated(true);
        checkAuthAndFetchCredits();
      } else {
        setIsAuthenticated(false);
        setUserCredits(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  // Landing page navigation
  const landingNavLinks = [{
    name: t('nav.features'),
    href: "#features"
  }, {
    name: t('nav.pricing'), 
    href: "#pricing"
  }, {
    name: t('nav.aboutUs'),
    href: "#about"
  }];

  // Authenticated user navigation
  const userNavLinks = isAuthenticated ? [{
    name: t('nav.dashboard'),
    href: "/dashboard"
  }, {
    name: t('nav.resumeEditor'),
    href: "/resume-editor"
  }] : [];

  // Combine links based on page type
  const navLinks = isLandingPage ? [...landingNavLinks, ...userNavLinks] : userNavLinks;
  return <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary">
              ResumeATS-Builder
            </Link>
          </div>

          {/* Desktop Navigation Links and Auth - Right Side */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {navLinks.map(link => 
                link.href.startsWith('#') ? (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                )
              )}
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Credits Display */}
            {isAuthenticated && userCredits !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-700">{userCredits} {t('common.credits')}</span>
              </div>
            )}
            
            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <Button size="sm" asChild>
                <Link to="/auth">{t('nav.getStarted')}</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}>
                {t('nav.signOut')}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-muted-foreground hover:text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={cn("md:hidden overflow-hidden transition-all duration-300 ease-in-out", isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
          <div className="px-2 pt-2 pb-6 space-y-4">
            {/* Mobile Navigation Links */}
            {navLinks.map(link => link.href.startsWith('#') ? <a key={link.name} href={link.href} className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200" onClick={() => setIsOpen(false)}>
                  {link.name}
                </a> : <Link key={link.name} to={link.href} className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200" onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>)}

            {/* Mobile Credits and Auth */}
            <div className="flex flex-col space-y-3 px-3 pt-4">
              {/* Mobile Language Switcher */}
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>

              {/* Mobile Credits Display */}
              {isAuthenticated && userCredits !== null && <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <span className="text-base font-semibold text-yellow-700">{userCredits} {t('common.credits')}</span>
                </div>}
              
              {/* Mobile Auth Buttons */}
              {!isAuthenticated ? <Button size="sm" className="w-full" asChild>
                  <Link to="/auth">{t('nav.getStarted')}</Link>
                 </Button> : <Button variant="outline" size="sm" className="w-full" onClick={async () => {
                   await supabase.auth.signOut();
                   window.location.href = '/';
                 }}>
                   {t('nav.signOut')}
                 </Button>}
            </div>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;
