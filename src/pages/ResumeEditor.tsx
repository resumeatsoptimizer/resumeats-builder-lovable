import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ResumeTemplate } from '@/components/ResumeTemplate';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { PDFGenerator } from '@/components/PDFGenerator';
import LanguageSelection from '@/components/LanguageSelection';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, X, Upload, User, ArrowLeft, Download, Share2, Languages, Trash2, FileText, Zap, Target, Menu, Settings } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useNavigate } from 'react-router-dom';
interface WorkExperience {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}
interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationYear: string;
  gpa?: string;
  projects?: string;
}
interface ResumeData {
  personalInfo: {
    fullName: string;
    phone: string;
    email: string;
    linkedin: string;
  portfolio?: string;
  website?: string;
    address?: string;
    profileImage?: string;
  };
  summary: string;
  skills: string[];
  workExperience: WorkExperience[];
  education: Education[];
  certifications: string[];
  awards: string[];
}
const ResumeEditor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [templateName, setTemplateName] = useState('Professional');
  const [themeColor, setThemeColor] = useState('#3b82f6');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing resume if ID is provided in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setResumeId(id);
      loadResume(id);
    }
  }, []);

  const loadResume = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setResumeData(data.resume_data as unknown as ResumeData);
        setTemplateName(data.template_name);
        setThemeColor(data.theme_color || '#3b82f6');
        setIsPublic(data.is_public);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast({
        title: "Error",
        description: "Failed to load resume",
        variant: "destructive"
      });
    }
  };
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      phone: '',
      email: '',
      linkedin: '',
      portfolio: '',
      website: ''
    },
    summary: '',
    skills: [],
    workExperience: [{
      id: '1',
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ['']
    }],
    education: [{
      id: '1',
      degree: '',
      institution: '',
      location: '',
      graduationYear: '',
      gpa: '',
      projects: ''
    }],
    certifications: [''],
    awards: ['']
  });
  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };
  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };
  const removeSkill = (skillToRemove: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "กรุณาเลือกรูปภาพที่มีขนาดไม่เกิน 2MB",
        variant: "destructive"
      });
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = e => {
      const base64String = e.target?.result as string;
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          profileImage: base64String
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteProfileImage = () => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        profileImage: undefined
      }
    }));
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "รูปโปรไฟล์ถูกลบแล้ว",
      description: "รูปโปรไฟล์ของคุณถูกลบเรียบร้อยแล้ว"
    });
  };
  const generateSampleData = () => {
    setResumeData({
      personalInfo: {
        fullName: "สมชาย ใจดี",
        phone: "+66 81 234 5678",
        email: "somchai.jaidee@email.com",
        linkedin: "linkedin.com/in/somchai-jaidee",
        portfolio: "portfolio.somchai.com",
        website: "www.somchai.com",
        address: "123/456 Sukhumvit Road, Watthana, Bangkok 10110"
      },
      summary: "Digital Marketing Specialist with 5+ years of experience in developing and executing successful digital marketing campaigns. Proven track record of increasing brand awareness and driving sales growth through strategic use of SEO, SEM, and social media marketing.",
      skills: ["Digital Marketing", "Google Analytics", "SEO/SEM", "Social Media Marketing", "Content Marketing", "Google Ads", "Facebook Ads", "Data Analysis"],
      workExperience: [{
        id: '1',
        position: "Senior Digital Marketing Specialist",
        company: "ABC Company Ltd.",
        location: "Bangkok, Thailand",
        startDate: "Jan 2021",
        endDate: "Present",
        description: ["Increased organic website traffic by 150% through SEO optimization", "Managed Google Ads campaigns with ROI of 300%", "Led social media strategy resulting in 200% follower growth"]
      }, {
        id: '2',
        position: "Marketing Coordinator",
        company: "XYZ Marketing Agency",
        location: "Bangkok, Thailand",
        startDate: "Jun 2019",
        endDate: "Dec 2020",
        description: ["Coordinated marketing campaigns across multiple channels", "Analyzed campaign performance using Google Analytics", "Created content for social media platforms"]
      }],
      education: [{
        id: '1',
        degree: "Master of Business Administration (Marketing)",
        institution: "Thammasat University",
        location: "Bangkok, Thailand",
        graduationYear: "2021",
        gpa: "3.75",
        projects: "Thesis: Digital Transformation in Thai SMEs - A Marketing Perspective"
      }, {
        id: '2',
        degree: "Bachelor of Business Administration (Marketing)",
        institution: "Chulalongkorn University",
        location: "Bangkok, Thailand",
        graduationYear: "2019",
        gpa: "3.65",
        projects: "Senior Project: Digital Marketing Strategy for SMEs"
      }],
      certifications: ["Google Ads Certified", "Google Analytics Individual Qualification (IQ)", "Facebook Blueprint Certified", "HubSpot Inbound Marketing Certified"],
      awards: ["Best Digital Campaign Award - Marketing Excellence 2023", "Top Performer of the Quarter - Q3 2023", "Outstanding Achievement in SEO - Company Awards 2022"]
    });
  };
  const addWorkExperience = () => {
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        id: Date.now().toString(),
        position: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ['']
      }]
    }));
  };
  const deleteWorkExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id)
    }));
  };
  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => exp.id === id ? {
        ...exp,
        [field]: value
      } : exp)
    }));
  };
  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        degree: '',
        institution: '',
        location: '',
        graduationYear: '',
        gpa: '',
        projects: ''
      }]
    }));
  };
  const deleteEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? {
        ...edu,
        [field]: value
      } : edu)
    }));
  };
  const handleSave = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save a resume",
          variant: "destructive"
        });
        return;
      }
      const resumeToSave = {
        user_id: user.id,
        template_name: templateName,
        theme_color: themeColor,
        resume_data: resumeData as any,
        is_public: isPublic
      };
      let result;
      if (resumeId) {
        // Update existing resume
        result = await supabase.from('resumes').update(resumeToSave).eq('id', resumeId).select('id').single();
      } else {
        // Insert new resume
        result = await supabase.from('resumes').insert(resumeToSave).select('id').single();
      }
      const {
        data,
        error
      } = result;
      if (error) throw error;

      // Set the resume ID for QR code and PDF generation
      if (data?.id && !resumeId) {
        setResumeId(data.id);
      }
      toast({
        title: "Success",
        description: "Resume saved successfully!"
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleAiEnhancement = async () => {
    try {
      setIsEnhancing(true);
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to use AI features",
          variant: "destructive"
        });
        return;
      }

      // Enhance the professional summary
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-enhance', {
        body: {
          text: resumeData.summary,
          section: 'summary'
        }
      });
      if (error) throw error;
      setResumeData(prev => ({
        ...prev,
        summary: data.enhancedText
      }));
      toast({
        title: "AI Enhancement Complete",
        description: `Enhanced your summary! Credits remaining: ${data.credits}`
      });
    } catch (error) {
      console.error('Error enhancing resume:', error);
      toast({
        title: "Error",
        description: "Failed to enhance resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };
  const handleJobMatchAnalysis = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsAnalyzing(true);
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to use AI features",
          variant: "destructive"
        });
        return;
      }
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-job-match', {
        body: {
          resumeData,
          jobDescription
        }
      });
      if (error) throw error;
      toast({
        title: `Job Match: ${data.matchingScore}%`,
        description: data.analysis,
        duration: 10000
      });
      console.log('Full analysis:', data.analysis);
    } catch (error) {
      console.error('Error analyzing job match:', error);
      toast({
        title: "Error",
        description: "Failed to analyze job match. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleResumeUpdate = (updatedData: ResumeData) => {
    setResumeData(updatedData);
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop Header */}
          {!isMobile ? (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('editor.backToHome')}
                </Button>
                <h1 className="text-2xl font-bold text-foreground">{t('editor.title')}</h1>
              </div>
              <div className="flex items-center gap-4">
                {/* Template & Theme */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Template:</Label>
                    <Select value={templateName} onValueChange={setTemplateName}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Creative">Creative</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Theme:</Label>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-md border cursor-pointer" style={{
                      backgroundColor: themeColor
                    }} onClick={() => setShowColorPicker(!showColorPicker)} />
                      {showColorPicker && <div className="absolute z-10 mt-2 right-0">
                          <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                          <div className="bg-white p-3 rounded-lg shadow-lg border">
                            <HexColorPicker color={themeColor} onChange={setThemeColor} />
                          </div>
                        </div>}
                    </div>
                  </div>
                </div>
                
                
                <Button onClick={handleSave}>Save Resume</Button>
              </div>
            </div>
          ) : (
            /* Mobile Header */
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/')} className="flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  {t('editor.backToHome')}
                </Button>
                <h1 className="text-lg font-bold text-foreground">{t('editor.title')}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} size="sm">{t('editor.save')}</Button>
                <Sheet open={showMobileControls} onOpenChange={setShowMobileControls}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="space-y-6 mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          {t('editor.title')}
                        </h3>
                        
                        {/* Template Selection */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('editor.template')}</Label>
                          <Select value={templateName} onValueChange={setTemplateName}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Professional">Professional</SelectItem>
                              <SelectItem value="Creative">Creative</SelectItem>
                              <SelectItem value="Corporate">Corporate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Theme Color */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{t('editor.theme')}</Label>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md border cursor-pointer" style={{
                            backgroundColor: themeColor
                          }} onClick={() => setShowColorPicker(!showColorPicker)} />
                            <span className="text-sm text-muted-foreground">Tap to change</span>
                          </div>
                          {showColorPicker && <div className="mt-4">
                              <HexColorPicker color={themeColor} onChange={setThemeColor} />
                            </div>}
                        </div>
                        
                        {/* Public Toggle */}
                        <div className="flex items-center justify-between">
                          <Label htmlFor="mobile-public-resume" className="text-sm font-medium">
                            {t('editor.public')}
                          </Label>
                          <Switch id="mobile-public-resume" checked={isPublic} onCheckedChange={setIsPublic} />
                        </div>
                        
                        {/* PDF Download */}
                        <div className="pt-4 border-t">
                          <PDFGenerator resumeId={resumeId || ''} resumeTitle={resumeData.personalInfo.fullName || 'My Resume'} />
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        {!isMobile ? (
          /* Desktop Layout - Side by side panels */
          <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-280px)]">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="p-6 h-full overflow-y-auto">
                <div className="space-y-6">
                 {/* Profile Photo Upload */}
                  <Card>
                   <CardHeader>
                     <CardTitle>{t('editor.profileImage')}</CardTitle>
                   </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {resumeData.personalInfo.profileImage ? <img src={resumeData.personalInfo.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-border" /> : <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                            <User className="w-8 h-8 text-muted-foreground" />
                          </div>}
                      </div>
                      <div className="space-y-2">
                         <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                           <Upload className="w-4 h-4" />
                           {t('editor.uploadImage')}
                         </Button>
                        {resumeData.personalInfo.profileImage && (
                          <Button type="button" variant="outline" onClick={handleDeleteProfileImage} className="flex items-center gap-2 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                            ลบรูปภาพ
                          </Button>
                        )}
                        <p className="text-xs text-muted-foreground">
                          รองรับไฟล์ JPG, PNG (สูงสุด 2MB)
                        </p>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleImageUpload} className="hidden" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button type="button" variant="secondary" onClick={generateSampleData} className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Generate Sample
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                  <Card>
                   <CardHeader>
                     <CardTitle>{t('editor.personalInfo')}</CardTitle>
                   </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <Label htmlFor="fullName">{t('editor.fullName')}</Label>
                         <Input id="fullName" value={resumeData.personalInfo.fullName} onChange={e => updatePersonalInfo('fullName', e.target.value)} placeholder="Your full name" />
                       </div>
                       <div>
                         <Label htmlFor="phone">{t('editor.phone')}</Label>
                         <Input id="phone" value={resumeData.personalInfo.phone} onChange={e => updatePersonalInfo('phone', e.target.value)} placeholder="+66 81 234 5678" />
                       </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="email">{t('editor.email')}</Label>
                         <Input id="email" type="email" value={resumeData.personalInfo.email} onChange={e => updatePersonalInfo('email', e.target.value)} placeholder="your.email@example.com" />
                       </div>
                       <div>
                         <Label htmlFor="linkedin">LinkedIn</Label>
                         <Input id="linkedin" value={resumeData.personalInfo.linkedin} onChange={e => updatePersonalInfo('linkedin', e.target.value)} placeholder="linkedin.com/in/yourprofile" />
                       </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="portfolio">Portfolio ({t('editor.optional')})</Label>
                         <Input 
                           id="portfolio" 
                           value={resumeData.personalInfo.portfolio || ''} 
                           onChange={e => updatePersonalInfo('portfolio', e.target.value)} 
                           placeholder="portfolio.yourname.com" 
                         />
                       </div>
                       <div>
                         <Label htmlFor="website">{t('editor.website')} ({t('editor.optional')})</Label>
                         <Input 
                           id="website" 
                           value={resumeData.personalInfo.website || ''} 
                           onChange={e => updatePersonalInfo('website', e.target.value)} 
                           placeholder="www.yourname.com" 
                         />
                       </div>
                     </div>
                     <div>
                       <Label htmlFor="address">{t('editor.address')} ({t('editor.optional')})</Label>
                      <Input 
                        id="address" 
                        value={resumeData.personalInfo.address || ''} 
                        onChange={e => updatePersonalInfo('address', e.target.value)} 
                        placeholder="123 Main St, Bangkok 10110, Thailand" 
                      />
                    </div>
                  </CardContent>
                </Card>

                 {/* Professional Summary */}
                 <Card>
                   <CardHeader>
                     <CardTitle>{t('editor.summary')}</CardTitle>
                   </CardHeader>
                  <CardContent>
                    <Textarea value={resumeData.summary} onChange={e => setResumeData(prev => ({
                    ...prev,
                    summary: e.target.value
                  }))} placeholder="Write a compelling professional summary highlighting your key achievements and skills..." className="min-h-[120px]" />
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <span>Skills</span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="เพิ่มทักษะ" className="w-full sm:w-48" onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }} />
                        <Button type="button" onClick={addSkill} size="sm" className="whitespace-nowrap">
                          <Plus className="w-4 h-4" />
                          Add Skill
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                     {resumeData.skills.length > 0 ? <div className="flex flex-wrap gap-2">
                         {resumeData.skills.map((skill, index) => <Badge key={index} variant="secondary" className="flex items-center gap-1">
                             {skill}
                             <Button type="button" variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-transparent" onClick={() => removeSkill(skill)}>
                               <X className="w-3 h-3" />
                             </Button>
                           </Badge>)}
                       </div> : <p className="text-muted-foreground text-sm">{t('editor.addSkill')}</p>}
                  </CardContent>
                </Card>

                 {/* Work Experience */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex justify-between items-center">
                       {t('editor.workExperience')}
                       <Button variant="outline" size="sm" onClick={addWorkExperience}>
                         {t('editor.addExperience')}
                       </Button>
                     </CardTitle>
                   </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.workExperience.map((exp, index) => <div key={exp.id} className="space-y-4 p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Experience #{index + 1}</h4>
                          {resumeData.workExperience.length > 1 && <Button variant="outline" size="sm" onClick={() => deleteWorkExperience(exp.id)} className="flex items-center gap-1 text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>}
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <Label>{t('editor.position')}</Label>
                             <Input value={exp.position} onChange={e => updateWorkExperience(exp.id, 'position', e.target.value)} placeholder="e.g., Senior Marketing Specialist" />
                           </div>
                           <div>
                             <Label>{t('editor.company')}</Label>
                             <Input value={exp.company} onChange={e => updateWorkExperience(exp.id, 'company', e.target.value)} placeholder="Company name" />
                           </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                             <Label>{t('editor.location')}</Label>
                             <Input value={exp.location} onChange={e => updateWorkExperience(exp.id, 'location', e.target.value)} placeholder="Bangkok, Thailand" />
                           </div>
                           <div>
                             <Label>{t('editor.startDate')}</Label>
                             <Input value={exp.startDate} onChange={e => updateWorkExperience(exp.id, 'startDate', e.target.value)} placeholder="Jan 2020" />
                           </div>
                           <div>
                             <Label>{t('editor.endDate')}</Label>
                             <Input value={exp.endDate} onChange={e => updateWorkExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" />
                           </div>
                         </div>
                         <div>
                           <Label>{t('editor.description')}</Label>
                           <Textarea value={exp.description.join('\n')} onChange={e => updateWorkExperience(exp.id, 'description', e.target.value.split('\n'))} placeholder="• Achieved 150% of quarterly sales targets..." rows={4} />
                         </div>
                      </div>)}
                  </CardContent>
                </Card>

                 {/* Education */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex justify-between items-center">
                       {t('editor.education')}
                       <Button variant="outline" size="sm" onClick={addEducation}>
                         {t('editor.addEducation')}
                       </Button>
                     </CardTitle>
                   </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.education.map((edu, index) => <div key={edu.id} className="space-y-4 p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Education #{index + 1}</h4>
                          {resumeData.education.length > 1 && <Button variant="outline" size="sm" onClick={() => deleteEducation(edu.id)} className="flex items-center gap-1 text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <Label>{t('editor.degree')}</Label>
                             <Input value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Business Administration" />
                           </div>
                           <div>
                             <Label>{t('editor.institution')}</Label>
                             <Input value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} placeholder="Chulalongkorn University" />
                           </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                             <Label>{t('editor.location')}</Label>
                             <Input value={edu.location} onChange={e => updateEducation(edu.id, 'location', e.target.value)} placeholder="Bangkok, Thailand" />
                           </div>
                           <div>
                             <Label>GPA ({t('editor.optional')})</Label>
                             <Input value={edu.gpa || ''} onChange={e => updateEducation(edu.id, 'gpa', e.target.value)} placeholder="3.75" />
                           </div>
                           <div>
                             <Label>{t('editor.graduationYear')}</Label>
                             <Input value={edu.graduationYear} onChange={e => updateEducation(edu.id, 'graduationYear', e.target.value)} placeholder="2018" />
                           </div>
                         </div>
                         <div>
                           <Label>{t('editor.projects')} ({t('editor.optional')})</Label>
                          <Textarea value={edu.projects || ''} onChange={e => updateEducation(edu.id, 'projects', e.target.value)} placeholder="Relevant projects or activities..." rows={2} />
                        </div>
                      </div>)}
                  </CardContent>
                </Card>

                 {/* Certifications */}
                 <Card>
                   <CardHeader>
                     <CardTitle>{t('editor.certifications')}</CardTitle>
                   </CardHeader>
                  <CardContent>
                    <Textarea value={resumeData.certifications.join('\n')} onChange={e => setResumeData(prev => ({
                    ...prev,
                    certifications: e.target.value.split('\n')
                  }))} placeholder="• Google Ads Certified&#10;• Facebook Blueprint Certified&#10;• HubSpot Inbound Marketing Certified" rows={4} />
                  </CardContent>
                </Card>

                 {/* Awards */}
                 <Card>
                   <CardHeader>
                     <CardTitle>{t('editor.awards')}</CardTitle>
                   </CardHeader>
                  <CardContent>
                    <Textarea value={resumeData.awards.join('\n')} onChange={e => setResumeData(prev => ({
                    ...prev,
                    awards: e.target.value.split('\n')
                  }))} placeholder="• Top Performer of the Year 2023&#10;• Best Campaign Award - Digital Marketing Conference 2022" rows={4} />
                  </CardContent>
                </Card>

                {/* AI-Powered Enhancement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      AI-Powered Enhancement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enhance your professional summary with AI (1 credit)
                    </p>
                    <Button onClick={handleAiEnhancement} disabled={isEnhancing || !resumeData.summary.trim()} className="w-full">
                      {isEnhancing ? 'Enhancing...' : 'Enhance Summary'}
                    </Button>
                  </CardContent>
                </Card>

                 {/* Job Match Analysis */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Target className="w-4 h-4" />
                       {t('editor.jobMatch')}
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <p className="text-sm text-muted-foreground">
                       {t('pricing.jobMatchCredit')}
                     </p>
                     <Textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder={t('editor.jobDescription')} rows={4} />
                     <Button onClick={handleJobMatchAnalysis} disabled={isAnalyzing || !jobDescription.trim()} className="w-full">
                       {isAnalyzing ? t('editor.analyzing') : t('editor.jobMatch')}
                     </Button>
                   </CardContent>
                 </Card>

                 {/* Language Translation */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Languages className="w-4 h-4" />
                       {t('editor.translate')}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                       {t('pricing.translationCredit')}
                     </p>
                     <LanguageSelection resumeData={resumeData} onResumeUpdate={handleResumeUpdate} />
                   </CardContent>
                 </Card>
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="p-6 h-full overflow-y-auto bg-gray-50">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-center text-foreground">{t('editor.preview')}</h2>
                </div>
                <div className="bg-white rounded-lg shadow-sm">
                  <ResumeTemplate data={resumeData} template={templateName} themeColor={themeColor} />
                </div>
                 
                 {/* Dashboard Link */}
                 <div className="mt-6 text-center">
                   <Button 
                     variant="outline" 
                     onClick={() => navigate('/dashboard')}
                     className="w-full"
                   >
                     เรซูเม่ของคุณ
                   </Button>
                 </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* Mobile Layout - Stacked vertically */
          <div className="space-y-6">
            {/* Mobile Form Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{t('editor.title')}</h2>
              <div className="space-y-6">
                 {/* Profile Photo Upload */}
                <Card>
                   <CardHeader>
                     <CardTitle>{t('editor.profileImage')}</CardTitle>
                   </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {resumeData.personalInfo.profileImage ? <img src={resumeData.personalInfo.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-border" /> : <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                            <User className="w-8 h-8 text-muted-foreground" />
                          </div>}
                      </div>
                      <div className="space-y-2">
                         <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                           <Upload className="w-4 h-4" />
                           {t('editor.uploadImage')}
                         </Button>
                        {resumeData.personalInfo.profileImage && (
                          <Button type="button" variant="outline" onClick={handleDeleteProfileImage} className="flex items-center gap-2 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                            ลบรูปภาพ
                          </Button>
                        )}
                        <p className="text-xs text-muted-foreground">
                          รองรับไฟล์ JPG, PNG (สูงสุด 2MB)
                        </p>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleImageUpload} className="hidden" />
                      </div>
                    </div>
                    <div className="mt-4">
                       <Button type="button" variant="secondary" onClick={generateSampleData} className="flex items-center gap-2">
                         <FileText className="w-4 h-4" />
                         {t('editor.generateSample')}
                       </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information - Mobile */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={resumeData.personalInfo.fullName} onChange={e => updatePersonalInfo('fullName', e.target.value)} placeholder="Your full name" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={resumeData.personalInfo.phone} onChange={e => updatePersonalInfo('phone', e.target.value)} placeholder="+66 81 234 5678" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={resumeData.personalInfo.email} onChange={e => updatePersonalInfo('email', e.target.value)} placeholder="your.email@example.com" />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input id="linkedin" value={resumeData.personalInfo.linkedin} onChange={e => updatePersonalInfo('linkedin', e.target.value)} placeholder="linkedin.com/in/yourprofile" />
                      </div>
                      <div>
                        <Label htmlFor="portfolio">Portfolio/Website (Optional)</Label>
                        <Input id="portfolio" value={resumeData.personalInfo.portfolio || ''} onChange={e => updatePersonalInfo('portfolio', e.target.value)} placeholder="your-portfolio.com" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea value={resumeData.summary} onChange={e => setResumeData(prev => ({
                    ...prev,
                    summary: e.target.value
                  }))} placeholder="Write a compelling professional summary highlighting your key achievements and skills..." className="min-h-[120px]" />
                  </CardContent>
                </Card>

                {/* Skills - Mobile Friendly */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="เพิ่มทักษะ" onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }} />
                      <Button type="button" onClick={addSkill} size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>
                    {resumeData.skills.length > 0 ? <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <Button type="button" variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-transparent" onClick={() => removeSkill(skill)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>)}
                      </div> : <p className="text-muted-foreground text-sm">ยังไม่มีทักษะที่เพิ่ม กรุณาเพิ่มทักษะของคุณ</p>}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Mobile Preview Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{t('editor.preview')}</h2>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <ResumeTemplate data={resumeData} template={templateName} themeColor={themeColor} />
              </div>
              
              {/* Dashboard Link */}
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  เรซูเม่ของคุณ
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>;
};
export default ResumeEditor;