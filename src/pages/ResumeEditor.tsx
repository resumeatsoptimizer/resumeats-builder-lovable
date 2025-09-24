import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
      const { data: { user } } = await supabase.auth.getUser();
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

      const { data, error } = result;
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

  const handleResumeUpdate = (updatedData: ResumeData) => {
    setResumeData(updatedData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="w-full px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('dashboard.backToHome')}
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
                    <div 
                      className="w-8 h-8 rounded-md border cursor-pointer" 
                      style={{ backgroundColor: themeColor }}
                      onClick={() => setShowColorPicker(!showColorPicker)} 
                    />
                    {showColorPicker && (
                      <div className="absolute z-10 mt-2 right-0">
                        <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          <HexColorPicker color={themeColor} onChange={setThemeColor} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSave}>Save Resume</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Fluid Grid Layout */}
      <div className="w-full min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-screen">
          {/* Left Column - Form */}
          <div className="bg-background p-6 overflow-y-auto max-h-screen">
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('editor.personalInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="fullName">{t('editor.fullName')}</Label>
                      <Input 
                        id="fullName" 
                        value={resumeData.personalInfo.fullName} 
                        onChange={e => updatePersonalInfo('fullName', e.target.value)} 
                        placeholder={t('editor.fullNamePlaceholder')} 
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
                        placeholder={t('editor.linkedinPlaceholder')} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="portfolio">Portfolio</Label>
                      <Input 
                        id="portfolio" 
                        value={resumeData.personalInfo.portfolio || ''} 
                        onChange={e => updatePersonalInfo('portfolio', e.target.value)} 
                        placeholder={t('editor.portfolioPlaceholder')} 
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
                        placeholder="https://www.yourname.com" 
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
                    onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))} 
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

              {/* Generate Sample Data Button */}
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={generateSampleData} 
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Generate Sample Data
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="bg-gray-50 p-6 overflow-y-auto max-h-screen">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-center text-foreground">{t('editor.preview')}</h2>
            </div>
            <div className="bg-white rounded-lg shadow-sm">
              <ResumeTemplate 
                data={resumeData} 
                template={templateName} 
                themeColor={themeColor} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;