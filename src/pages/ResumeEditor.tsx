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
import { ResumeTemplate } from '@/components/ResumeTemplate';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { PDFGenerator } from '@/components/PDFGenerator';
import LanguageSelection from '@/components/LanguageSelection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Upload, User, ArrowLeft, Download, Share2, Languages } from 'lucide-react';
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
  const [templateName, setTemplateName] = useState('Professional');
  const [themeColor, setThemeColor] = useState('#3b82f6');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      phone: '',
      email: '',
      linkedin: '',
      portfolio: ''
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
      personalInfo: { ...prev.personalInfo, [field]: value }
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
    reader.onload = (e) => {
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

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string | string[]) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
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

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
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

      const { data, error } = await supabase
        .from('resumes')
        .upsert({
          user_id: user.id,
          template_name: templateName,
          resume_data: resumeData as any,
          is_public: isPublic
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      // Set the resume ID for QR code and PDF generation
      if (data?.id) {
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
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Resume Editor</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="public-resume"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public-resume" className="text-sm">
                Make public
              </Label>
            </div>
            
            <Button onClick={handleSave}>Save Resume</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Actions Cards Above Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PDFGenerator 
                resumeId={resumeId || ''}
                resumeTitle={resumeData.personalInfo.fullName || 'My Resume'}
              />
              <QRCodeGenerator 
                resumeId={resumeId || ''}
                resumeTitle={resumeData.personalInfo.fullName || 'My Resume'}
              />
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Resume
              </Button>
            </CardContent>
          </Card>

          {/* Template & Theme */}
          <Card>
            <CardHeader>
              <CardTitle>Template & Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template</Label>
                <Select value={templateName} onValueChange={setTemplateName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Creative">Creative</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Color Theme</Label>
                <div className="relative">
                  <div 
                    className="w-full h-10 rounded-md border cursor-pointer flex items-center px-3"
                    style={{ backgroundColor: themeColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <span className="text-white font-medium">{themeColor}</span>
                  </div>
                  {showColorPicker && (
                    <div className="absolute z-10 mt-2">
                      <div 
                        className="fixed inset-0" 
                        onClick={() => setShowColorPicker(false)}
                      />
                      <div className="bg-white p-3 rounded-lg shadow-lg border">
                        <HexColorPicker color={themeColor} onChange={setThemeColor} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Translation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                แปลภาษา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageSelection 
                resumeData={resumeData}
                onResumeUpdate={handleResumeUpdate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-280px)]">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="p-6 h-full overflow-y-auto">
              <div className="space-y-6">
                {/* Profile Photo Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
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
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          อัพโหลดรูปภาพ
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          รองรับไฟล์ JPG, PNG (สูงสุด 2MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                          placeholder="+66 81 234 5678"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => updatePersonalInfo('email', e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                          placeholder="linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="portfolio">Portfolio/Website (Optional)</Label>
                      <Input
                        id="portfolio"
                        value={resumeData.personalInfo.portfolio || ''}
                        onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                        placeholder="your-portfolio.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={resumeData.summary}
                      onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Write a compelling professional summary highlighting your key achievements and skills..."
                      className="min-h-[120px]"
                    />
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="เพิ่มทักษะ เช่น Digital Marketing, Google Analytics"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill} size="sm">
                        <Plus className="w-4 h-4" />
                        Add Skill
                      </Button>
                    </div>
                    
                    {resumeData.skills.length > 0 && (
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
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">แนะนำทักษะ:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Digital Marketing:</span> SEO, SEM, Content Marketing, Social Media Marketing
                        </div>
                        <div>
                          <span className="font-medium">Analytics:</span> Google Analytics, Data Analysis, A/B Testing
                        </div>
                        <div>
                          <span className="font-medium">Tools:</span> Google Ads, Facebook Ads Manager, HubSpot
                        </div>
                        <div>
                          <span className="font-medium">Soft Skills:</span> Strategic Planning, Project Management, Team Leadership
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Work Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      Work Experience
                      <Button variant="outline" size="sm" onClick={addWorkExperience}>
                        Add Experience
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.workExperience.map((exp, index) => (
                      <div key={exp.id} className="space-y-4 p-4 border rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Position</Label>
                            <Input
                              value={exp.position}
                              onChange={(e) => updateWorkExperience(exp.id, 'position', e.target.value)}
                              placeholder="e.g., Senior Marketing Specialist"
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                              placeholder="Company name"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={exp.location}
                              onChange={(e) => updateWorkExperience(exp.id, 'location', e.target.value)}
                              placeholder="Bangkok, Thailand"
                            />
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              value={exp.startDate}
                              onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                              placeholder="Jan 2020"
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              value={exp.endDate}
                              onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                              placeholder="Present"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description.join('\n')}
                            onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value.split('\n'))}
                            placeholder="• Achieved 150% of quarterly sales targets..."
                            rows={4}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      Education
                      <Button variant="outline" size="sm" onClick={addEducation}>
                        Add Education
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="space-y-4 p-4 border rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              placeholder="Bachelor of Business Administration"
                            />
                          </div>
                          <div>
                            <Label>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              placeholder="Chulalongkorn University"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={edu.location}
                              onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                              placeholder="Bangkok, Thailand"
                            />
                          </div>
                          <div>
                            <Label>Graduation Year</Label>
                            <Input
                              value={edu.graduationYear}
                              onChange={(e) => updateEducation(edu.id, 'graduationYear', e.target.value)}
                              placeholder="2018"
                            />
                          </div>
                          <div>
                            <Label>GPA (Optional)</Label>
                            <Input
                              value={edu.gpa || ''}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              placeholder="3.75"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Projects (Optional)</Label>
                          <Textarea
                            value={edu.projects || ''}
                            onChange={(e) => updateEducation(edu.id, 'projects', e.target.value)}
                            placeholder="Relevant projects or activities..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={resumeData.certifications.join('\n')}
                      onChange={(e) => setResumeData(prev => ({ ...prev, certifications: e.target.value.split('\n') }))}
                      placeholder="• Google Ads Certified&#10;• Facebook Blueprint Certified&#10;• HubSpot Inbound Marketing Certified"
                      rows={4}
                    />
                  </CardContent>
                </Card>

                {/* Awards */}
                <Card>
                  <CardHeader>
                    <CardTitle>Awards & Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={resumeData.awards.join('\n')}
                      onChange={(e) => setResumeData(prev => ({ ...prev, awards: e.target.value.split('\n') }))}
                      placeholder="• Top Performer of the Year 2023&#10;• Best Campaign Award - Digital Marketing Conference 2022"
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="p-6 h-full overflow-y-auto bg-gray-50">
              <div className="bg-white rounded-lg shadow-sm min-h-full">
                <ResumeTemplate 
                  data={resumeData} 
                  template={templateName}
                  themeColor={themeColor}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ResumeEditor;