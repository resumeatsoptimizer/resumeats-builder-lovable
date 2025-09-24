import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

interface Translations {
  [key: string]: {
    th: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.getStarted': { th: 'Get Started', en: 'Get Started' },
  'nav.signOut': { th: 'ออกจากระบบ', en: 'Sign Out' },
  'nav.resumeEditor': { th: 'แก้ไขเรซูเม่', en: 'Resume Editor' },
  'nav.features': { th: 'คุณสมบัติ', en: 'Features' },
  'nav.pricing': { th: 'แผนราคา', en: 'Pricing' },
  'nav.aboutUs': { th: 'เกี่ยวกับเรา', en: 'About Us' },
  'nav.dashboard': { th: 'แดชบอร์ด', en: 'Dashboard' },
  
  // Hero Section
  'hero.title': { th: 'สร้างเรซูเม่ ATS-Friendly ง่ายดายเพียง 5 นาที', en: 'Create Your ATS-Friendly Resume in 5 Minutes' },
  'hero.subtitle': { th: 'เรซูเม่มืออาชีพที่ผ่าน ATS พร้อมการปรับแต่งด้วย AI เพื่อเพิ่มโอกาสสมัครงานสำเร็จ', en: 'Craft professional resumes optimized for ATS and enhanced with AI to boost your job success' },
  'hero.cta': { th: 'เริ่มสร้างเรซูเม่เลย', en: 'Start Building Your Resume' },
  'hero.tryFree': { th: 'ทดลองใช้ฟรี', en: 'Try for Free' },
    
  'features.title': { th: 'ฟีเจอร์ทรงพลัง', en: 'Powerful Features' },
  'features.subtitle': { th: 'เครื่องมือครบชุดสำหรับสร้างเรซูเม่มืออาชีพ', en: 'All-in-one tools for creating a professional resume' },
  
  'feature.atsReady.title': { th: 'รองรับ ATS 100%', en: '100% ATS Compatible' },
  'feature.atsReady.desc': { th: 'เรซูเม่ที่ผ่านระบบ ATS ได้อย่างมั่นใจ', en: 'Resumes fully optimized for ATS systems' },
  
  'feature.aiPowered.title': { th: 'เสริมด้วยพลัง AI', en: 'AI-Powered Enhancement' },
  'feature.aiPowered.desc': { th: 'ยกระดับเนื้อหาด้วย AI อัจฉริยะ', en: 'Elevate your content with intelligent AI' },
  
  'feature.templates.title': { th: 'เทมเพลต ATS-Friendly', en: 'ATS-Friendly Templates' },
  'feature.templates.desc': { th: 'ดีไซน์พิเศษเพื่อการผ่าน ATS โดยเฉพาะ', en: 'Professionally designed to pass ATS screening' },
  
  'feature.match.title': { th: 'Job Match Analysis', en: 'Job Match Analysis' },
  'feature.match.desc': { th: 'ตรวจสอบความเข้ากับตำแหน่งงานเป้าหมาย', en: 'Assess compatibility with target job positions' },
  
  'feature.translation.title': { th: 'AI Translation 12 Languages', en: 'AI Translation in 12 Languages' },
  'feature.translation.desc': { th: 'แปลเรซูเม่ได้หลายภาษาอย่างมืออาชีพด้วย AI', en: 'Translate resumes into 12 languages with AI precision' },
  
  'feature.onlineResume.title': { th: 'เรซูเม่ออนไลน์', en: 'Online Resume' },
  'feature.onlineResume.desc': { th: 'แชร์เรซูเม่ง่าย ๆ ด้วย QR Code', en: 'Easily share your resume with a QR code' },
  
  'feature.instantDownload.title': { th: 'ดาวน์โหลดได้ทันที', en: 'Instant Download' },
  'feature.instantDownload.desc': { th: 'บันทึกเป็นไฟล์ Word พร้อมแก้ไขได้ทันใจ', en: 'Save as an editable Word file instantly' },
  
  'feature.autoApply.title': { th: 'สมัครงานอัตโนมัติ', en: 'Auto Job Application' },
  'feature.autoApply.desc': { th: 'ส่งอีเมลสมัครงานไปยังหลายบริษัทได้ในคลิกเดียว', en: 'Apply to multiple companies automatically with just one click' },

  // ATS Section
  'ats.title': { th: 'เรซูเม่ที่ HR ได้เห็น 100% ไม่พลาดโอกาสสมัครงาน', en: 'Ensure HR Sees Your Resume — 100% Visibility, Zero Missed Opportunities' },
  'ats.subtitle': { th: 'ATS (Applicant Tracking System) คือระบบที่บริษัทและ HR ใช้ในการคัดกรองเรซูเม่อัตโนมัติ หากเรซูเม่ไม่เป็นมิตรกับ ATS ข้อมูลสำคัญอาจไม่ถูกอ่านหรือถูกตัดออก ทำให้พลาดโอกาสไปโดยไม่รู้ตัว', en: 'An ATS (Applicant Tracking System) is software used by recruiters to automatically screen resumes. If your resume isn\'t ATS-friendly, important details may not be read or may get rejected before reaching the recruiter.' },
  'ats.description': { th: 'เรซูเม่แบบ ATS-Friendly จึงหมายถึงเรซูเม่ที่ออกแบบและจัดรูปแบบมาให้ระบบ ATS อ่านได้ครบถ้วน ช่วยเพิ่มโอกาสให้ HR เห็นข้อมูลจริงของคุณ และผ่านด่านแรกของการคัดเลือก', en: 'An ATS-Friendly Resume is designed and formatted so that ATS can accurately read your information — ensuring your skills and experience get noticed and improving your chances of passing the first screening.' },
    
  // Footer
  'footer.product': { th: 'ผลิตภัณฑ์', en: 'Product' },
  'footer.company': { th: 'บริษัท', en: 'Company' },
  'footer.support': { th: 'ฝ่ายสนับสนุน', en: 'Support' },
  'footer.legal': { th: 'ด้านกฎหมาย', en: 'Legal' },
  
  'footer.templates': { th: 'เทมเพลต', en: 'Templates' },
  'footer.examples': { th: 'ตัวอย่าง', en: 'Examples' },
  'footer.aboutUs': { th: 'เกี่ยวกับเรา', en: 'About Us' },
  'footer.careers': { th: 'ร่วมงานกับเรา', en: 'Careers' },
  'footer.contact': { th: 'ติดต่อเรา', en: 'Contact Us' },
  'footer.help': { th: 'ช่วยเหลือ', en: 'Help Center' },
  'footer.privacy': { th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy Policy' },
  'footer.terms': { th: 'ข้อกำหนดการใช้งาน', en: 'Terms of Service' },
  'footer.rights': { th: 'สงวนลิขสิทธิ์', en: 'All rights reserved' },
  
  // Pricing Page
  'pricing.title': { th: 'แผนราคา', en: 'Pricing Plans' },
  'pricing.subtitle': { th: 'เลือกแผนที่เหมาะกับคุณ', en: 'Choose the plan that fits your needs' },
  'pricing.free': { th: 'ฟรี', en: 'Free' },
  'pricing.basic': { th: 'พื้นฐาน', en: 'Basic' },
  'pricing.premium': { th: 'พรีเมียม', en: 'Premium' },
  'pricing.month': { th: 'เดือน', en: 'month' },
  'pricing.popular': { th: 'ยอดนิยม!', en: 'Most Popular!' },
  'pricing.getStarted': { th: 'เริ่มใช้งาน', en: 'Get Started' },
  'pricing.currentPlan': { th: 'แผนปัจจุบัน', en: 'Current Plan' },
  'pricing.upgrade': { th: 'อัพเกรด', en: 'Upgrade' },
  
  // Features list
  'pricing.features.basicResume': { th: 'สร้างเรซูเม่พื้นฐาน', en: 'Basic resume creation' },
  'pricing.features.atsTemplates': { th: 'เทมเพลต ATS', en: 'ATS templates' },
  'pricing.features.pdfDownload': { th: 'ดาวน์โหลด PDF', en: 'PDF download' },
  'pricing.features.aiEnhancement': { th: 'การปรับปรุงด้วย AI', en: 'AI Enhancement uses' },
  'pricing.features.jobMatch': { th: 'Job Match Analysis', en: 'Job Match Analysis' },
  'pricing.features.translation': { th: 'Language Resume Translation', en: 'Language Resume Translation' },
  'pricing.features.validMonths': { th: 'ใช้ได้ {months} เดือน', en: 'Valid for {months} months' },
  'pricing.features.bestValue': { th: 'คุณค่าที่ดีที่สุด!', en: 'Best Value!' },
  
  // Credit usage
  'pricing.creditUsage': { th: 'การใช้เครดิต', en: 'Credit Usage' },
  'pricing.enhancement': { th: 'AI Enhancement', en: 'AI Enhancement' },
  'pricing.enhancementCredit': { th: '1 เครดิต ต่อการปรับปรุง', en: '1 credit per enhancement' },
  'pricing.jobMatchCredit': { th: '2 เครดิต ต่อการวิเคราะห์', en: '2 credits per analysis' },
  'pricing.translationCredit': { th: '3 เครดิต ต่อการแปลเรซูเม่', en: '3 credits per resume translation' },
  
  // Editor specific
  'editor.prefix': { th: 'คำนำหน้า', en: 'Prefix' },
  'editor.selectPrefix': { th: 'เลือกคำนำหน้า', en: 'Select prefix' },
  'editor.birthDate': { th: 'วันเกิด', en: 'Birth Date' },
  'editor.age': { th: 'อายุ', en: 'Age' },
  'editor.years': { th: 'ปี', en: 'years' },
  'editor.deleteImage': { th: 'ลบรูปภาพ', en: 'Delete Image' },
  
  // Auth
  'auth.signIn': { th: 'เข้าสู่ระบบ', en: 'Sign In' },
  'auth.signUp': { th: 'สมัครสมาชิก', en: 'Sign Up' },
  'auth.email': { th: 'อีเมล', en: 'Email' },
  'auth.password': { th: 'รหัสผ่าน', en: 'Password' },
  'auth.fullName': { th: 'ชื่อ-นามสกุล', en: 'Full Name' },
  'auth.fullNamePlaceholder': { th: 'จอห์น โด', en: 'John Doe' },
  'auth.passwordRequirement': { th: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', en: 'Password must be at least 6 characters' },
  'auth.signingIn': { th: 'กำลังเข้าสู่ระบบ...', en: 'Signing in...' },
  'auth.signingUp': { th: 'กำลังสมัครสมาชิก...', en: 'Signing up...' },
  'auth.googleSignIn': { th: 'เข้าสู่ระบบด้วย Google', en: 'Sign in with Google' },
  'auth.or': { th: 'หรือ', en: 'Or' },
  'auth.description': { th: 'เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มสร้างเรซูเม่', en: 'Sign in or create an account to start building your resume' },
  'auth.emailExists': { th: 'อีเมลนี้มีการสมัครสมาชิกแล้ว กรุณาเข้าสู่ระบบ', en: 'This email is already registered. Please sign in' },
  'auth.passwordShort': { th: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', en: 'Password must be at least 6 characters' },
  'auth.invalidLogin': { th: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', en: 'Invalid email or password' },
  'auth.signUpSuccess': { th: 'สมัครสมาชิกสำเร็จ', en: 'Sign up successful' },
  'auth.signUpCheck': { th: 'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ', en: 'Please check your email to verify your account' },
  'auth.signInSuccess': { th: 'เข้าสู่ระบบสำเร็จ', en: 'Sign in successful' },
  'auth.welcome': { th: 'ยินดีต้อนรับสู่ ResumeATS-Builder!', en: 'Welcome to ResumeATS-Builder!' },
  
  // Dashboard translations
  'dashboard.yourResumes': { th: 'เรซูเม่ของคุณ', en: 'Your Resumes' },
  'dashboard.backToHome': { th: 'กลับไปหน้าหลัก', en: 'Back to Home' },
  'dashboard.manageResumes': { th: 'จัดการและดูเรซูเม่ที่บันทึกไว้ทั้งหมด', en: 'Manage and view all your saved resumes' },
  'dashboard.createNewResume': { th: 'สร้างเรซูเม่ใหม่', en: 'Create New Resume' },
  'dashboard.totalResumes': { th: 'เรซูเม่ทั้งหมด', en: 'Total Resumes' },
  'dashboard.publicResumes': { th: 'เรซูเม่สาธารณะ', en: 'Public Resumes' },
  'dashboard.lastUpdated': { th: 'แก้ไขล่าสุด', en: 'Last Updated' },
  'dashboard.noResumes': { th: 'ยังไม่มีเรซูเม่', en: 'No resumes yet' },
  'dashboard.getStartedText': { th: 'เริ่มต้นด้วยการสร้างเรซูเม่แรกของคุณ', en: 'Get started by creating your first resume' },
  'dashboard.createFirstResume': { th: 'สร้างเรซูเม่แรกของคุณ', en: 'Create Your First Resume' },
  'dashboard.templateName': { th: 'เทมเพลต {name}', en: '{name} Template' },
  'dashboard.public': { th: 'สาธารณะ', en: 'Public' },
  'dashboard.private': { th: 'ส่วนตัว', en: 'Private' },
  'dashboard.created': { th: 'สร้างเมื่อ', en: 'Created' },
  'dashboard.updated': { th: 'แก้ไขเมื่อ', en: 'Updated' },
  'dashboard.makePublic': { th: 'เผยแพร่สาธารณะ', en: 'Make public' },
  'dashboard.edit': { th: 'แก้ไข', en: 'Edit' },
  'dashboard.deleteResume': { th: 'ลบเรซูเม่', en: 'Delete Resume' },
  'dashboard.deleteConfirmation': { th: 'คุณแน่ใจหรือไม่ว่าต้องการลบเรซูเม่นี้? การกระทำนี้ไม่สามารถยกเลิกได้', en: 'Are you sure you want to delete this resume? This action cannot be undone.' },
  'dashboard.delete': { th: 'ลบ', en: 'Delete' },
  'dashboard.resumeDeleted': { th: 'ลบเรซูเม่เรียบร้อยแล้ว', en: 'Resume deleted successfully' },
  'dashboard.resumeNow': { th: 'เรซูเม่เป็น', en: 'Resume is now' },
  'dashboard.untitledResume': { th: 'เรซูเม่ไม่มีชื่อ', en: 'Untitled Resume' },
  'dashboard.errorLoadResumes': { th: 'ไม่สามารถโหลดเรซูเม่ได้', en: 'Failed to load resumes' },

  // Common
  'common.loading': { th: 'กำลังโหลด...', en: 'Loading...' },
  'common.save': { th: 'บันทึก', en: 'Save' },
  'common.cancel': { th: 'ยกเลิก', en: 'Cancel' },
  'common.confirm': { th: 'ยืนยัน', en: 'Confirm' },
  'common.credits': { th: 'เครดิต', en: 'Credits' },
  'common.success': { th: 'สำเร็จ', en: 'Success' },
  'common.error': { th: 'ข้อผิดพลาด', en: 'Error' },
  'editor.personalInfo': { th: 'ข้อมูลส่วนตัว', en: 'Personal Information' },
  'editor.fullName': { th: 'ชื่อ-นามสกุล', en: 'Full Name' },
  'editor.phone': { th: 'โทรศัพท์', en: 'Phone' },
  'editor.email': { th: 'อีเมล', en: 'Email' },
  'editor.linkedin': { th: 'LinkedIn', en: 'LinkedIn' },
  'editor.portfolio': { th: 'Portfolio', en: 'Portfolio' },
  'editor.website': { th: 'เว็บไซต์', en: 'Website' },
  'editor.address': { th: 'ที่อยู่', en: 'Address' },
  'editor.profileImage': { th: 'รูปโปรไฟล์', en: 'Profile Image' },
  'editor.uploadImage': { th: 'อัปโหลดรูป', en: 'Upload Image' },
  'editor.summary': { th: 'สรุปเกี่ยวกับตัว', en: 'Professional Summary' },
  'editor.skills': { th: 'ทักษะ', en: 'Skills' },
  
  // Section headings
  'skills': { th: 'ความสามารถ/ทักษะ', en: 'Abilities & Skills' },
  'professionalSummary': { th: 'สรุปประสบการณ์การทำงาน', en: 'Professional Summary' },
  'workExperience': { th: 'ประสบการณ์การทำงาน', en: 'Work Experience' },
  'education': { th: 'การศึกษา', en: 'Education' },
  'certifications': { th: 'ใบรับรอง/ประกาศนียบัตร', en: 'Certifications' },
  'awards': { th: 'รางวัลและการยกย่อง', en: 'Awards and Recognition' },
  'editor.addSkill': { th: 'เพิ่มทักษะ', en: 'Add Skill' },
  'editor.workExperience': { th: 'ประสบการณ์การทำงาน', en: 'Work Experience' },
  'editor.position': { th: 'ตำแหน่ง', en: 'Position' },
  'editor.company': { th: 'บริษัท', en: 'Company' },
  'editor.startDate': { th: 'วันที่เริ่ม', en: 'Start Date' },
  'editor.endDate': { th: 'วันที่สิ้นสุด', en: 'End Date' },
  'editor.description': { th: 'รายละเอียด', en: 'Description' },
  'editor.addExperience': { th: 'เพิ่มประสบการณ์', en: 'Add Experience' },
  'editor.education': { th: 'การศึกษา', en: 'Education' },
  'editor.degree': { th: 'ปริญญา', en: 'Degree' },
  'editor.institution': { th: 'สถาบัน', en: 'Institution' },
  'editor.location': { th: 'สถานที่', en: 'Location' },
  'editor.graduationYear': { th: 'ปีที่จบ', en: 'Graduation Year' },
  'editor.gpa': { th: 'เกรดเฉลี่ย', en: 'GPA' },
  'editor.projects': { th: 'โปรเจค', en: 'Projects' },
  'editor.optional': { th: 'ไม่บังคับ', en: 'Optional' },
  'editor.addEducation': { th: 'เพิ่มการศึกษา', en: 'Add Education' },
  'editor.certifications': { th: 'ใบรับรอง', en: 'Certifications' },
  'editor.awards': { th: 'รางวัล', en: 'Awards' },
  'editor.template': { th: 'เทมเพลต', en: 'Template' },
  'editor.theme': { th: 'สีธีม', en: 'Theme Color' },
  'editor.preview': { th: 'ตัวอย่าง', en: 'Preview' },
  'editor.aiEnhance': { th: 'ปรับปรุงด้วย AI', en: 'AI Enhance' },
  'editor.jobMatch': { th: 'Job Match Analysis', en: 'Job Match Analysis' },
  'editor.translate': { th: 'แปลภาษา', en: 'Translate' },
  'editor.save': { th: 'บันทึก', en: 'Save' },
  'editor.download': { th: 'ดาวน์โหลด Word', en: 'Download Word' },
  'editor.share': { th: 'แชร์', en: 'Share' },
  'editor.public': { th: 'เผยแพร่สาธารณะ', en: 'Make Public' },
  'editor.jobDescription': { th: 'รายละเอียดงาน (สำหรับ Job Match)', en: 'Job Description (for Job Match)' },
  'editor.enhancing': { th: 'กำลังปรับปรุง...', en: 'Enhancing...' },
  'editor.analyzing': { th: 'กำลังวิเคราะห์...', en: 'Analyzing...' },
  'editor.generateSample': { th: 'สร้างข้อมูลตัวอย่าง', en: 'Generate Sample Data' },
  'editor.backToHome': { th: 'ไปที่ แดชบอร์ด', en: 'Go to Dashboard' },
  
  // Dashboard specific
  'dashboard.template': { th: 'เทมเพลต', en: 'Template' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('th');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'th' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    
    let result = translation[language];
    
    // Handle template replacement for parameters like {name}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(`{${paramKey}}`, paramValue);
      });
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
