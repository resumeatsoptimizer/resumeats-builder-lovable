import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PersonalInfo {
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
}


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
  personalInfo: PersonalInfo;
  summary: string;
  skills: string[];
  workExperience: WorkExperience[];
  education: Education[];
  certifications: string[];
  awards: string[];
}

interface ResumeTemplateProps {
  data: ResumeData;
  template: string;
  themeColor?: string;
}

export const ResumeTemplate = ({ data, template, themeColor = 'slate' }: ResumeTemplateProps) => {
  const { personalInfo, summary, skills, workExperience, education, certifications, awards } = data;
  const { t } = useLanguage();

  // Get theme color styles using hex color
  const getThemeColors = () => {
    const hexColor = themeColor?.startsWith('#') ? themeColor : '#64748b'; // default to slate
    
    // Corporate template uses black text only
    if (template === 'Corporate') {
      return {
        headerStyle: {
          background: 'transparent'
        },
        accentStyle: {
          color: '#000000',
          borderColor: '#000000'
        },
        headerTextStyle: {
          color: '#000000'
        }
      };
    }
    
    return {
      headerStyle: {
        background: `linear-gradient(135deg, ${hexColor}dd, ${hexColor})`
      },
      accentStyle: {
        color: hexColor,
        borderColor: hexColor
      }
    };
  };

  // Template layout styling (templates change layout, not colors)
  const getTemplateStyles = () => {    
    switch (template) {
      case 'Creative':
        return {
          layout: 'creative',
          headerPadding: 'p-10',
          sectionSpacing: 'space-y-8',
          nameSize: 'text-5xl'
        };
      case 'Corporate':
        return {
          layout: 'corporate',
          headerPadding: 'p-6',
          sectionSpacing: 'space-y-6',
          nameSize: 'text-3xl'
        };
      default: // Professional
        return {
          layout: 'professional',
          headerPadding: 'p-8',
          sectionSpacing: 'space-y-6',
          nameSize: 'text-4xl'
        };
    }
  };

  const styles = getTemplateStyles();
  const colors = getThemeColors();

  return (
    <div className="max-w-4xl mx-auto bg-white text-black text-sm leading-relaxed">
      {/* Header */}
      <div 
        className={`${template === 'Corporate' ? 'text-black' : 'text-white'} ${styles.headerPadding} flex items-center gap-6`}
        style={colors.headerStyle}
      >
        {personalInfo.profileImage && (
          <img
            src={personalInfo.profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover shadow-lg"
            style={{ border: `3px solid ${template === 'Corporate' ? '#000000' : '#ffffff'}` }}
          />
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">
            <span className="text-sm">{personalInfo.prefix && `${personalInfo.prefix} `}</span>
            <span className="text-base">{personalInfo.fullName || 'Your Name'}</span>
            <span className="text-sm">{personalInfo.age && personalInfo.age > 0 && ` ${t('editor.age')} ${personalInfo.age} ${t('editor.years')}`}</span>
          </h2>
          <div className="text-sm opacity-95 leading-tight space-y-0">
            {(personalInfo.phone || personalInfo.email) && (
              <p>{t('editor.phone')}: {personalInfo.phone || ''}, {t('editor.email')}: {personalInfo.email || ''}</p>
            )}
            {personalInfo.linkedin && <p>LinkedIn: {personalInfo.linkedin}</p>}
            {personalInfo.portfolio && <p>Portfolio: {personalInfo.portfolio}</p>}
            {personalInfo.website && <p>{t('editor.website')}: {personalInfo.website}</p>}
            {personalInfo.address && <p>{t('editor.address')}: {personalInfo.address}</p>}
          </div>
        </div>
      </div>

      <div className={`p-6 ${styles.sectionSpacing}`}>
        {template === 'Creative' ? (
          // Creative Template: 2-column layout with proper flow order
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              {/* Left Column: Professional Summary, Work Experience, Certifications */}
              {summary && (
                <section>
                  <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                    {t('professionalSummary').toUpperCase()}
                  </h2>
                  <p className="text-justify">{summary}</p>
                </section>
              )}

              {workExperience.length > 0 && workExperience[0].position && (
                <section>
                  <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                    {t('workExperience').toUpperCase()}
                  </h2>
                  <div className="space-y-4">
                    {workExperience.map((exp) => (
                      <div key={exp.id}>
                        {exp.position && (
                          <>
                            <div className="mb-2">
                              <h3 className="font-bold" style={colors.accentStyle}>
                                {exp.position} | {exp.company}
                              </h3>
                              <p className="text-gray-600 text-xs">{exp.location}</p>
                              <p className="text-gray-600 text-xs">{exp.startDate} – {exp.endDate}</p>
                            </div>
                            {exp.description.length > 0 && exp.description[0] && (
                              <ul className="space-y-1 ml-4">
                                {exp.description.map((desc, index) => (
                                  desc.trim() && (
                                    <li key={index} className="list-disc text-xs">
                                      {desc.trim()}
                                    </li>
                                  )
                                ))}
                              </ul>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {certifications.length > 0 && certifications[0] && (
                <section>
                  <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                    {t('certifications').toUpperCase()}
                  </h2>
                  <ul className="space-y-1 ml-4">
                    {certifications.map((cert, index) => (
                      cert.trim() && (
                        <li key={index} className="list-disc text-xs">
                          {cert.trim()}
                        </li>
                      )
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <div className="space-y-8">
              {/* Right Column: Skills, Education, Awards */}
              {skills.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                    {t('skills').toUpperCase()}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium rounded-full border bg-gray-50"
                        style={colors.accentStyle}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {education.length > 0 && education[0].degree && (
                <section>
                  <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                    {t('education').toUpperCase()}
                  </h2>
                  <div className="space-y-3">
                    {education.map((edu) => (
                      <div key={edu.id}>
                        {edu.degree && (
                          <>
                            <div>
                              <h3 className="font-bold" style={colors.accentStyle}>
                                {edu.degree}
                              </h3>
                              <p className="text-xs">{edu.institution} | {edu.location} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
                              <p className="text-gray-600 text-xs">{edu.graduationYear}</p>
                              {edu.projects && (
                                <div className="mt-2">
                                  <ul className="space-y-1 ml-4">
                                    {edu.projects.split('\n').map((project, idx) => (
                                      project.trim() && (
                                        <li key={idx} className="list-disc text-gray-600 text-xs">
                                          {project.trim()}
                                        </li>
                                      )
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {awards.length > 0 && awards[0] && (
                <section>
                  <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                    {t('awards').toUpperCase()}
                  </h2>
                  <ul className="space-y-1 ml-4">
                    {awards.map((award, index) => (
                      award.trim() && (
                        <li key={index} className="list-disc text-xs">
                          {award.trim()}
                        </li>
                      )
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        ) : (
          // Default layout for Professional and Corporate templates
          <>
            {/* Professional Summary */}
            {summary && (
              <section>
                <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                  {t('professionalSummary').toUpperCase()}
                </h2>
                <p className="text-justify">{summary}</p>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                  {t('skills').toUpperCase()}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs font-medium rounded-full border bg-gray-50"
                      style={colors.accentStyle}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Work Experience */}
            {workExperience.length > 0 && workExperience[0].position && (
              <section>
                <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                  {t('workExperience').toUpperCase()}
                </h2>
                <div className="space-y-4">
                  {workExperience.map((exp) => (
                    <div key={exp.id}>
                      {exp.position && (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold" style={colors.accentStyle}>
                                {exp.position} | {exp.company}
                              </h3>
                              <p className="text-gray-600">{exp.location}</p>
                            </div>
                            <div className="text-right text-gray-600">
                              <p>{exp.startDate} – {exp.endDate}</p>
                            </div>
                          </div>
                          {exp.description.length > 0 && exp.description[0] && (
                            <ul className="space-y-1 ml-4">
                              {exp.description.map((desc, index) => (
                                desc.trim() && (
                                  <li key={index} className="list-disc">
                                    {desc.trim()}
                                  </li>
                                )
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && education[0].degree && (
              <section>
                <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                  {t('education').toUpperCase()}
                </h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      {edu.degree && (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                               <h3 className="font-bold" style={colors.accentStyle}>
                                {edu.degree}
                              </h3>
                              <p>{edu.institution} | {edu.location} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
                              {edu.projects && (
                                <div className="mt-2">
                                  <ul className="space-y-1 ml-4">
                                    {edu.projects.split('\n').map((project, idx) => (
                                      project.trim() && (
                                        <li key={idx} className="list-disc text-gray-600">
                                          {project.trim()}
                                        </li>
                                      )
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="text-gray-600">
                              <p>{edu.graduationYear}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && certifications[0] && (
              <section>
                <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                  {t('certifications').toUpperCase()}
                </h2>
                <ul className="space-y-1 ml-4">
                  {certifications.map((cert, index) => (
                    cert.trim() && (
                      <li key={index} className="list-disc">
                        {cert.trim()}
                      </li>
                    )
                  ))}
                </ul>
              </section>
            )}

            {/* Awards */}
            {awards.length > 0 && awards[0] && (
              <section>
                <h2 className="text-lg font-bold mb-3 pb-1 border-b-2" style={colors.accentStyle}>
                  {t('awards').toUpperCase()}
                </h2>
                <ul className="space-y-1 ml-4">
                  {awards.map((award, index) => (
                    award.trim() && (
                      <li key={index} className="list-disc">
                        {award.trim()}
                      </li>
                    )
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};