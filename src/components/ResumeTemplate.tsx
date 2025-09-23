interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio?: string;
}

interface Skills {
  digitalMarketing: string[];
  analytics: string[];
  tools: string[];
  softSkills: string[];
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
  skills: Skills;
  workExperience: WorkExperience[];
  education: Education[];
  certifications: string[];
  awards: string[];
}

interface ResumeTemplateProps {
  data: ResumeData;
  template: string;
}

export const ResumeTemplate = ({ data, template }: ResumeTemplateProps) => {
  const { personalInfo, summary, skills, workExperience, education, certifications, awards } = data;

  // Professional template styling
  const getTemplateStyles = () => {
    switch (template) {
      case 'Creative':
        return {
          headerBg: 'bg-gradient-to-r from-blue-600 to-purple-600',
          headerText: 'text-white',
          sectionTitle: 'text-blue-600 border-b-2 border-blue-600',
          accentColor: 'text-blue-600'
        };
      case 'Corporate':
        return {
          headerBg: 'bg-gray-800',
          headerText: 'text-white',
          sectionTitle: 'text-gray-800 border-b-2 border-gray-800',
          accentColor: 'text-gray-800'
        };
      default: // Professional
        return {
          headerBg: 'bg-slate-700',
          headerText: 'text-white',
          sectionTitle: 'text-slate-700 border-b-2 border-slate-700',
          accentColor: 'text-slate-700'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 text-black text-sm leading-relaxed">
      {/* Header */}
      <div className={`${styles.headerBg} ${styles.headerText} p-6 rounded-t-lg`}>
        <h1 className="text-3xl font-bold mb-2">{personalInfo.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Professional Summary */}
        {summary && (
          <section>
            <h2 className={`text-lg font-bold mb-3 pb-1 ${styles.sectionTitle}`}>
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-justify">{summary}</p>
          </section>
        )}

        {/* Skills */}
        <section>
          <h2 className={`text-lg font-bold mb-3 pb-1 ${styles.sectionTitle}`}>
            SKILLS
          </h2>
          <div className="space-y-2">
            {skills.digitalMarketing.length > 0 && (
              <div>
                <span className={`font-semibold ${styles.accentColor}`}>Digital Marketing: </span>
                <span>{skills.digitalMarketing.join(', ')}</span>
              </div>
            )}
            {skills.analytics.length > 0 && (
              <div>
                <span className={`font-semibold ${styles.accentColor}`}>Analytics & Reporting: </span>
                <span>{skills.analytics.join(', ')}</span>
              </div>
            )}
            {skills.tools.length > 0 && (
              <div>
                <span className={`font-semibold ${styles.accentColor}`}>Tools: </span>
                <span>{skills.tools.join(', ')}</span>
              </div>
            )}
            {skills.softSkills.length > 0 && (
              <div>
                <span className={`font-semibold ${styles.accentColor}`}>Soft Skills: </span>
                <span>{skills.softSkills.join(', ')}</span>
              </div>
            )}
          </div>
        </section>

        {/* Work Experience */}
        {workExperience.length > 0 && workExperience[0].position && (
          <section>
            <h2 className={`text-lg font-bold mb-3 pb-1 ${styles.sectionTitle}`}>
              WORK EXPERIENCE
            </h2>
            <div className="space-y-4">
              {workExperience.map((exp) => (
                <div key={exp.id}>
                  {exp.position && (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className={`font-bold ${styles.accentColor}`}>
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
            <h2 className={`text-lg font-bold mb-3 pb-1 ${styles.sectionTitle}`}>
              EDUCATION
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  {edu.degree && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-bold ${styles.accentColor}`}>
                            {edu.degree}
                          </h3>
                          <p>{edu.institution} | {edu.location}</p>
                          {edu.gpa && <p className="text-gray-600">• {edu.gpa}</p>}
                          {edu.projects && <p className="text-gray-600">• {edu.projects}</p>}
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
            <h2 className={`text-lg font-bold mb-3 pb-1 ${styles.sectionTitle}`}>
              CERTIFICATIONS
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
            <h2 className={`text-lg font-bold mb-3 pb-1 ${styles.sectionTitle}`}>
              AWARDS AND RECOGNITION
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
      </div>
    </div>
  );
};