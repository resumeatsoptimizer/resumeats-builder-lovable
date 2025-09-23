import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ResumeTemplate } from '@/components/ResumeTemplate';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { PDFGenerator } from '@/components/PDFGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  };
  summary: string;
  skills: {
    digitalMarketing: string[];
    analytics: string[];
    tools: string[];
    softSkills: string[];
  };
  workExperience: WorkExperience[];
  education: Education[];
  certifications: string[];
  awards: string[];
}

const ResumeEditor = () => {
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState('Professional');
  const [resumeId, setResumeId] = useState<string | null>(null);
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      phone: '',
      email: '',
      linkedin: '',
      portfolio: ''
    },
    summary: '',
    skills: {
      digitalMarketing: [],
      analytics: [],
      tools: [],
      softSkills: []
    },
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

  const updateSkills = (category: keyof ResumeData['skills'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: value.split(',').map(skill => skill.trim()).filter(Boolean)
      }
    }));
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
          resume_data: resumeData as any
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Resume Editor</h1>
          <div className="flex items-center gap-4">
            <Select value={templateName} onValueChange={setTemplateName}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Creative">Creative</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSave}>Save Resume</Button>
          </div>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-80px)]">
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="space-y-6">
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
                  <div>
                    <Label htmlFor="digitalMarketing">Digital Marketing</Label>
                    <Input
                      id="digitalMarketing"
                      value={resumeData.skills.digitalMarketing.join(', ')}
                      onChange={(e) => updateSkills('digitalMarketing', e.target.value)}
                      placeholder="SEO, SEM, Content Marketing, Social Media Marketing"
                    />
                  </div>
                  <div>
                    <Label htmlFor="analytics">Analytics & Reporting</Label>
                    <Input
                      id="analytics"
                      value={resumeData.skills.analytics.join(', ')}
                      onChange={(e) => updateSkills('analytics', e.target.value)}
                      placeholder="Google Analytics, Data Analysis, A/B Testing"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tools">Tools</Label>
                    <Input
                      id="tools"
                      value={resumeData.skills.tools.join(', ')}
                      onChange={(e) => updateSkills('tools', e.target.value)}
                      placeholder="Google Ads, Facebook Ads Manager, HubSpot"
                    />
                  </div>
                  <div>
                    <Label htmlFor="softSkills">Soft Skills</Label>
                    <Input
                      id="softSkills"
                      value={resumeData.skills.softSkills.join(', ')}
                      onChange={(e) => updateSkills('softSkills', e.target.value)}
                      placeholder="Strategic Planning, Project Management, Team Leadership"
                    />
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
                            placeholder="Senior Online Marketing Consultant"
                          />
                        </div>
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                            placeholder="Digital Growth Agency"
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
                            placeholder="มกราคม 2565"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            value={exp.endDate}
                            onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                            placeholder="ปัจจุบัน"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Job Description</Label>
                        <Textarea
                          value={exp.description.join('\n')}
                          onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value.split('\n'))}
                          placeholder="• Led digital marketing strategies for a portfolio of 8+ key clients...&#10;• Managed and optimized multi-channel advertising campaigns..."
                          className="min-h-[120px]"
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
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="space-y-4 p-4 border rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="ปริญญาตรี บริหารธุรกิจ สาขาการตลาด"
                          />
                        </div>
                        <div>
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            placeholder="มหาวิทยาลัยธรรมศาสตร์"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                            placeholder="กรุงเทพฯ, ประเทศไทย"
                          />
                        </div>
                        <div>
                          <Label>Graduation Year</Label>
                          <Input
                            value={edu.graduationYear}
                            onChange={(e) => updateEducation(edu.id, 'graduationYear', e.target.value)}
                            placeholder="พ.ศ. 2558"
                          />
                        </div>
                        <div>
                          <Label>GPA (Optional)</Label>
                          <Input
                            value={edu.gpa || ''}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="เกียรตินิยมอันดับสอง"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="p-6 h-full overflow-y-auto bg-muted/30">
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
                <p className="text-sm text-muted-foreground">Template: {templateName}</p>
              </div>
              
              {/* PDF and QR Code Controls */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                {resumeId && (
                  <>
                    <PDFGenerator 
                      resumeId={resumeId} 
                      resumeTitle={resumeData.personalInfo.fullName || 'My Resume'} 
                    />
                    <QRCodeGenerator 
                      resumeId={resumeId}
                      resumeTitle={resumeData.personalInfo.fullName || 'My Resume'}
                    />
                  </>
                )}
                {!resumeId && (
                  <div className="text-center p-4 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Save your resume first to enable PDF download and QR code sharing
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg">
              <ResumeTemplate data={resumeData} template={templateName} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ResumeEditor;