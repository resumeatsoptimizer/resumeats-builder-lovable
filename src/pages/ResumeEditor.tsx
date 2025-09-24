import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ResumeTemplate } from '@/components/ResumeTemplate';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { WordGenerator } from '@/components/WordGenerator';
import LanguageSelection from '@/components/LanguageSelection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, X, Upload, User, ArrowLeft, Download, Share2, Languages, Trash2, FileText, Zap, Target, Menu, Settings, CalendarIcon } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

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
    prefix: string;
    fullName: string;
    phone: string;
    email: string;
    linkedin: string;
    portfolio?: string;
    website?: string;
    address?: string;
    profileImage?: string;
    birthDate?: string;
    age?: number;
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
      prefix: '',
      fullName: '',
      phone: '',
      email: '',
      linkedin: '',
      portfolio: '',
      website: '',
      birthDate: '',
      age: 0
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

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const [day, month, year] = birthDate.split('/').map(Number);
    if (!day || !month || !year) return 0;
    
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string | number) => {
    setResumeData(prev => {
      const newPersonalInfo = {
        ...prev.personalInfo,
        [field]: value
      };
      
      // If birth date is updated, calculate age
      if (field === 'birthDate' && typeof value === 'string') {
        newPersonalInfo.age = calculateAge(value);
      }
      
      return {
        ...prev,
        personalInfo: newPersonalInfo
      };
    });
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
        prefix: "นาย",
        fullName: "Somchai Jaidee",
        phone: "+66 81 234 5678",
        email: "somchai.jaidee@email.com",
        linkedin: "https://linkedin.com/in/xxx-xxx",
        portfolio: "https://portfolio.xxx.com",
        website: "https://www.somchai.com",
        address: "123/456 Sukhumvit Road, Watthana, Bangkok 10110",
        birthDate: "15/03/1990",
        age: 34
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

  const renderEditorContent = () => (
    <div className="space-y-6">
      {/* Profile Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.profileImage')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {resumeData.personalInfo.profileImage ? (
                <img
                  src={resumeData.personalInfo.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('editor.uploadPhoto')}
              </Button>
              {resumeData.personalInfo.profileImage && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDeleteProfileImage}
                  className="w-full text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('editor.deletePhoto')}
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('editor.photoRequirements')}
          </p>
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
              <Input 
                id="fullName" 
                value={resumeData.personalInfo.fullName} 
                onChange={e => updatePersonalInfo('fullName', e.target.value)} 
                placeholder="Your full name" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">{t('editor.phone')}</Label>
              <Input 
                id="phone" 
                value={resumeData.personalInfo.phone} 
                onChange={e => updatePersonalInfo('phone', e.target.value)} 
                placeholder="+66 81 234 5678" 
              />
            </div>
            <div>
              <Label htmlFor="email">{t('editor.email')}</Label>
              <Input 
                id="email" 
                type="email" 
                value={resumeData.personalInfo.email} 
                onChange={e => updatePersonalInfo('email', e.target.value)} 
                placeholder="your.email@example.com" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input 
                id="linkedin" 
                value={resumeData.personalInfo.linkedin} 
                onChange={e => updatePersonalInfo('linkedin', e.target.value)} 
                placeholder="https://linkedin.com/in/xxx-xxx" 
              />
            </div>
            <div>
              <Label htmlFor="portfolio">Portfolio</Label>
              <Input 
                id="portfolio" 
                value={resumeData.personalInfo.portfolio || ''} 
                onChange={e => updatePersonalInfo('portfolio', e.target.value)} 
                placeholder="https://portfolio.xxx.com" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">{t('editor.website')}</Label>
              <Input 
                id="website" 
                value={resumeData.personalInfo.website || ''} 
                onChange={e => updatePersonalInfo('website', e.target.value)} 
                placeholder="www.yourname.com" 
              />
            </div>
            <div>
              <Label htmlFor="address">{t('editor.address')}</Label>
              <Input 
                id="address" 
                value={resumeData.personalInfo.address || ''} 
                onChange={e => updatePersonalInfo('address', e.target.value)} 
                placeholder="123 Main St, Bangkok 10110, Thailand" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.summary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={resumeData.summary} 
            onChange={e => setResumeData(prev => ({
              ...prev,
              summary: e.target.value
            }))} 
            placeholder="Write a compelling professional summary highlighting your key achievements and skills..." 
            className="min-h-[120px]" 
          />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <span>{t('skills')}</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                value={newSkill} 
                onChange={e => setNewSkill(e.target.value)} 
                placeholder="เพิ่มทักษะ" 
                className="w-full sm:w-48" 
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }} 
              />
              <Button type="button" onClick={addSkill} size="sm" className="whitespace-nowrap">
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resumeData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 hover:bg-transparent" 
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t('editor.addSkill')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="w-full py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('nav.backToHome')}
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              {t('editor.saveResume')}
            </Button>
            {resumeId && (
              <QRCodeGenerator resumeId={resumeId} />
            )}
            {resumeId && (
              <WordGenerator resumeId={resumeId} />
            )}
          </div>
        </div>

        {/* Main Content - Fluid Grid Layout */}
        {isMobile ? (
          // Mobile Layout with Sheet - Full Width
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">{t('editor.resumeEditor')}</h1>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4 mr-2" />
                    {t('editor.editResume')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                  <div className="p-6">
                    {renderEditorContent()}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="w-full bg-white p-4 rounded-lg shadow-sm border">
              <ResumeTemplate 
                data={resumeData} 
                template={templateName}
                themeColor={themeColor}
              />
            </div>
          </div>
        ) : (
          // Desktop Layout with Fluid Grid - Full Width
          <div className="w-full grid grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
            {/* Left Panel - Editor */}
            <div className="col-span-4 bg-white rounded-lg shadow-sm border">
              <div className="h-full p-6 overflow-y-auto">
                {renderEditorContent()}
              </div>
            </div>
            
            {/* Right Panel - Preview */}
            <div className="col-span-8 bg-gray-50 rounded-lg">
              <div className="h-full p-6 overflow-y-auto">
                <div className="w-full bg-white p-6 rounded-lg shadow-lg">
                  <ResumeTemplate 
                    data={resumeData} 
                    template={templateName}
                    themeColor={themeColor}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeEditor;
