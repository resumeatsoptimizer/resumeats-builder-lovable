import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
  const navLinks = [{
    name: "Features",
    href: "#features"
  }, {
    name: "Pricing",
    href: "/pricing"
  }, {
    name: "About Us",
    href: "#about"
  }, ...(isAuthenticated ? [{
    name: "Resume Editor",
    href: "/resume-editor"
  }] : [])];
  return <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        

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
              {/* Mobile Credits Display */}
              {isAuthenticated && userCredits !== null && <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <span className="text-base font-semibold text-yellow-700">{userCredits} Credits</span>
                </div>}
              
              {/* Mobile Auth Buttons */}
              {!isAuthenticated ? <Button size="sm" className="w-full" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button> : <Button variant="outline" size="sm" className="w-full" onClick={() => supabase.auth.signOut()}>
                  Sign Out
                </Button>}
            </div>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;