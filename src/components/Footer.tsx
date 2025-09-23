import { Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-foreground mb-4">
              ResumeATS-Builder
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              แพลตฟอร์มสร้างเรซูเม่ที่ผ่านระบบ ATS สำหรับนักศึกษาจบใหม่และผู้หางานยุคใหม่ในประเทศไทย
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              เมนูหลัก
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  ฟีเจอร์
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  ราคา
                </a>
              </li>
              <li>
                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  เกี่ยวกับเรา
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              ข้อมูลสำคัญ
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  ช่วยเหลือ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2025 ResumeATS-Builder. All Rights Reserved.
            </p>
            <p className="text-muted-foreground text-sm mt-4 md:mt-0">
              Made with ❤️ for Thai job seekers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;