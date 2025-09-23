interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio?: string;
  profileImage?: string;
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

  // Get theme color classes
  const getThemeColors = () => {
    switch (themeColor) {
      case 'blue':
        return {
          header: 'from-blue-600 to-blue-800',
          section: 'text-blue-700 border-blue-700',
          accent: 'text-blue-700'
        };
      case 'emerald':
        return {
          header: 'from-emerald-600 to-emerald-800',
          section: 'text-emerald-700 border-emerald-700',
          accent: 'text-emerald-700'
        };
      case 'violet':
        return {
          header: 'from-violet-600 to-violet-800',
          section: 'text-violet-700 border-violet-700',
          accent: 'text-violet-700'
        };
      case 'rose':
        return {
          header: 'from-rose-600 to-rose-800',
          section: 'text-rose-700 border-rose-700',
          accent: 'text-rose-700'
        };
      default: // slate
        return {
          header: 'from-slate-600 to-slate-800',
          section: 'text-slate-700 border-slate-700',
          accent: 'text-slate-700'
        };
    }
  };

  // Professional template styling
  const getTemplateStyles = () => {
    const colors = getThemeColors();
    
    switch (template) {
      case 'Creative':
        return {
          headerBg: `bg-gradient-to-r ${colors.header}`,
          headerText: 'text-white',
          sectionTitle: `${colors.section} border-b-2`,
          accentColor: colors.accent
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
          headerBg: `bg-gradient-to-r ${colors.header}`,
          headerText: 'text-white',
          sectionTitle: `${colors.section} border-b-2`,
          accentColor: colors.accent
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className="max-w-4xl mx-auto bg-white text-black text-sm leading-relaxed">
      {/* Header */}
      <div className={`${styles.headerBg} ${styles.headerText} p-8 flex items-center gap-6`}>
        {personalInfo.profileImage && (
          <img
            src={personalInfo.profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-3">{personalInfo.fullName || 'Your Name'}</h1>
          <div className="grid grid-cols-2 gap-2 text-sm opacity-95">
            {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
            {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
            {personalInfo.linkedin && <span>💼 {personalInfo.linkedin}</span>}
            {personalInfo.portfolio && <span>🌐 {personalInfo.portfolio}</span>}
          </div>
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
        {skills.length > 0 && (
          <section>
            <h2 className={`text-lg font-bold mb-3 pb-1 ${styles.sectionTitle}`}>
              SKILLS
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${styles.accentColor} bg-gray-50`}
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