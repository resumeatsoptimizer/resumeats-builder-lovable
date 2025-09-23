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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsAuthenticated(true);
        
        // Fetch user credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserCredits(profile.credits);
        }
      } else {
        setIsAuthenticated(false);
        setUserCredits(null);
      }
    };

    checkAuthAndFetchCredits();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "About Us", href: "#about" },
    { name: "Resume Editor", href: "/resume-editor" },
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-foreground">
              ResumeATS-Builder
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                link.href.startsWith('#') ? (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            {/* Credits and Auth */}
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              {isAuthenticated && userCredits !== null && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-700">{userCredits}</span>
                </div>
              )}
              
              {/* Auth Buttons */}
              {!isAuthenticated ? (
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/auth">Log In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/auth">Sign Up</Link>
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => supabase.auth.signOut()}
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-2 pt-2 pb-6 space-y-4">
            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              )
            ))}

            {/* Mobile Credits and Auth */}
            <div className="flex flex-col space-y-3 px-3 pt-4">
              {/* Mobile Credits Display */}
              {isAuthenticated && userCredits !== null && (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <span className="text-base font-semibold text-yellow-700">{userCredits} Credits</span>
                </div>
              )}
              
              {/* Mobile Auth Buttons */}
              {!isAuthenticated ? (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/auth">Log In</Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link to="/auth">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;