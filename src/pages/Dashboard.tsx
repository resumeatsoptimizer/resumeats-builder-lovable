import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit, Eye, Trash2, FileText, Clock, ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Resume {
  id: string;
  template_name: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  resume_data: any;
}

const Dashboard = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    fetchResumes();
  };

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching resumes:', error);
        toast({
          title: "Error",
          description: "Failed to load resumes",
          variant: "destructive"
        });
        return;
      }

      setResumes(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete resume",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Resume deleted successfully"
      });

      fetchResumes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive"
      });
    }
  };

  const togglePublic = async (id: string, currentPublicStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .update({ is_public: !currentPublicStatus })
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update resume visibility",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Resume is now ${!currentPublicStatus ? 'public' : 'private'}`
      });

      fetchResumes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update resume visibility",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResumeTitle = (resumeData: any) => {
    if (resumeData?.personalInfo?.fullName) {
      return resumeData.personalInfo.fullName;
    }
    return 'Untitled Resume';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your resumes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('dashboard.backToHome')}
              </Button>
              <Button onClick={() => navigate('/resume-editor')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('dashboard.createNew')}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{resumes.length}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.totalResumes')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{resumes.filter(r => r.is_public).length}</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.publicResumes')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {resumes.length > 0 ? formatDate(resumes[0].updated_at).split(' ')[0] : '-'}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.lastUpdated')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resume List */}
          {resumes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.noResumes')}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('dashboard.getStarted')}
                </p>
                <Button onClick={() => navigate('/resume-editor')}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('dashboard.createFirst')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card key={resume.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {getResumeTitle(resume.resume_data)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {resume.template_name} {t('dashboard.template')}
                        </p>
                      </div>
                      <Badge variant={resume.is_public ? "default" : "secondary"}>
                        {resume.is_public ? t('dashboard.public') : t('dashboard.private')}
                      </Badge>
                    </div>
                  </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          <p>{t('dashboard.created')}: {formatDate(resume.created_at)}</p>
                          <p>{t('dashboard.updated')}: {formatDate(resume.updated_at)}</p>
                        </div>

                       {/* Make Public Toggle */}
                       <div className="flex items-center space-x-2">
                         <Switch 
                           id={`public-${resume.id}`} 
                           checked={resume.is_public} 
                           onCheckedChange={() => togglePublic(resume.id, resume.is_public)} 
                         />
                          <Label htmlFor={`public-${resume.id}`} className="text-sm">
                            {t('dashboard.makePublic')}
                          </Label>
                       </div>

                       <div className="flex gap-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => navigate(`/resume-editor?id=${resume.id}`)}
                           className="flex-1"
                         >
                            <Edit className="w-4 h-4 mr-2" />
                            {t('dashboard.edit')}
                         </Button>
                         
                         {resume.is_public && (
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => window.open(`/resume/${resume.id}`, '_blank')}
                           >
                             <Eye className="w-4 h-4" />
                           </Button>
                         )}

                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="outline" size="sm">
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                                <AlertDialogTitle>{t('dashboard.delete')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('dashboard.deleteConfirm')}
                                </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteResume(resume.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t('dashboard.delete')}
                                </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </div>
                     </div>
                   </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;