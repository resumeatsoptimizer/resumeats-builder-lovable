import React from 'react';
import '../styles/resume-layouts.css';

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
  layout: string;
  themeColor?: string;
}

export const ResumeTemplate = ({ data, layout, themeColor = '#0b6efd' }: ResumeTemplateProps) => {
  const { personalInfo, summary, skills, workExperience, education, certifications, awards } = data;

  // Get layout class name
  const getLayoutClass = () => {
    switch (layout) {
      case 'Layout 1: Classic Two-Column':
        return 'layout-1';
      case 'Layout 2: Modern Single Column':
        return 'layout-2';
      case 'Layout 3: Left Sidebar':
        return 'layout-3';
      case 'Layout 4: Grid/Card Style':
        return 'layout-4';
      case 'Layout 5: Minimalist Centered':
        return 'layout-5';
      default:
        return 'layout-1';
    }
  };

  // Create contact info string
  const getContactInfo = () => {
    const contacts = [];
    if (personalInfo.phone) contacts.push(personalInfo.phone);
    if (personalInfo.email) contacts.push(personalInfo.email);
    if (personalInfo.linkedin) contacts.push(personalInfo.linkedin);
    if (personalInfo.portfolio) contacts.push(personalInfo.portfolio);
    return contacts.join(' • ');
  };

  const layoutClass = getLayoutClass();

  // Special handling for layout 3 (sidebar layout)
  if (layoutClass === 'layout-3') {
    return (
      <article className={`resume ${layoutClass}`} style={{ '--accent': themeColor } as React.CSSProperties}>
        <div className="sidebar">
          <header className="r-header">
            <h1 className="name">{personalInfo.fullName || 'Your Name'}</h1>
            <div className="contact">
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.email && <p>{personalInfo.email}</p>}
              {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
              {personalInfo.portfolio && <p>{personalInfo.portfolio}</p>}
            </div>
          </header>
          
          {skills.length > 0 && (
            <section className="skills">
              <h2>Skills</h2>
              <ul className="skill-list">
                {skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </section>
          )}

          {education.length > 0 && education[0].degree && (
            <section className="education">
              <h2>Education</h2>
              {education.map((edu) => (
                edu.degree && (
                  <div key={edu.id}>
                    <p><strong>{edu.degree}</strong></p>
                    <p>{edu.institution} — {edu.graduationYear}</p>
                    {edu.gpa && <p>GPA: {edu.gpa}</p>}
                  </div>
                )
              ))}
            </section>
          )}
        </div>

        <div className="main">
          {summary && (
            <section className="summary">
              <h2>Professional Summary</h2>
              <p>{summary}</p>
            </section>
          )}

          {workExperience.length > 0 && workExperience[0].position && (
            <section className="experience">
              <h2>Work Experience</h2>
              {workExperience.map((exp) => (
                exp.position && (
                  <article key={exp.id} className="job">
                    <h3 className="job-title">{exp.position} — {exp.company}</h3>
                    <p className="job-meta">{exp.startDate} — {exp.endDate} • {exp.location}</p>
                    {exp.description.length > 0 && exp.description[0] && (
                      <ul>
                        {exp.description.map((desc, index) => (
                          desc.trim() && <li key={index}>{desc.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                )
              ))}
            </section>
          )}

          {certifications.length > 0 && certifications[0] && (
            <section className="certifications">
              <h2>Certifications</h2>
              <ul>
                {certifications.map((cert, index) => (
                  cert.trim() && <li key={index}>{cert.trim()}</li>
                ))}
              </ul>
            </section>
          )}

          {awards.length > 0 && awards[0] && (
            <section className="awards">
              <h2>Awards</h2>
              <ul>
                {awards.map((award, index) => (
                  award.trim() && <li key={index}>{award.trim()}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    );
  }

  // Special handling for layout 1 (two-column)
  if (layoutClass === 'layout-1') {
    return (
      <article className={`resume ${layoutClass}`} style={{ '--accent': themeColor } as React.CSSProperties}>
        <header className="r-header">
          <h1 className="name">{personalInfo.fullName || 'Your Name'}</h1>
          <p className="tagline">{getContactInfo()}</p>
        </header>

        <main>
          <div className="left">
            {summary && (
              <section className="summary">
                <h2>Professional Summary</h2>
                <p>{summary}</p>
              </section>
            )}

            {skills.length > 0 && (
              <section className="skills">
                <h2>Skills</h2>
                <ul className="skill-list">
                  {skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </section>
            )}

            {education.length > 0 && education[0].degree && (
              <section className="education">
                <h2>Education</h2>
                {education.map((edu) => (
                  edu.degree && (
                    <div key={edu.id}>
                      <p><strong>{edu.degree}</strong> — {edu.institution} — {edu.graduationYear}</p>
                      {edu.gpa && <p>GPA: {edu.gpa}</p>}
                    </div>
                  )
                ))}
              </section>
            )}
          </div>

          <div className="right">
            {workExperience.length > 0 && workExperience[0].position && (
              <section className="experience">
                <h2>Work Experience</h2>
                {workExperience.map((exp) => (
                  exp.position && (
                    <article key={exp.id} className="job">
                      <h3 className="job-title">{exp.position} — {exp.company}</h3>
                      <p className="job-meta">{exp.startDate} — {exp.endDate} • {exp.location}</p>
                      {exp.description.length > 0 && exp.description[0] && (
                        <ul>
                          {exp.description.map((desc, index) => (
                            desc.trim() && <li key={index}>{desc.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                  )
                ))}
              </section>
            )}

            {certifications.length > 0 && certifications[0] && (
              <section className="certifications">
                <h2>Certifications</h2>
                <ul>
                  {certifications.map((cert, index) => (
                    cert.trim() && <li key={index}>{cert.trim()}</li>
                  ))}
                </ul>
              </section>
            )}

            {awards.length > 0 && awards[0] && (
              <section className="awards">
                <h2>Awards</h2>
                <ul>
                  {awards.map((award, index) => (
                    award.trim() && <li key={index}>{award.trim()}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </main>
      </article>
    );
  }

  // Special handling for layout 4 (grid/card style)
  if (layoutClass === 'layout-4') {
    return (
      <article className={`resume ${layoutClass}`} style={{ '--accent': themeColor } as React.CSSProperties}>
        <header className="r-header">
          <h1 className="name">{personalInfo.fullName || 'Your Name'}</h1>
          <p className="tagline">{getContactInfo()}</p>
        </header>

        <main>
          {summary && (
            <section className="summary">
              <h2>Professional Summary</h2>
              <p>{summary}</p>
            </section>
          )}

          {skills.length > 0 && (
            <section className="skills">
              <h2>Skills</h2>
              <ul className="skill-list">
                {skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </section>
          )}

          {workExperience.length > 0 && workExperience[0].position && (
            <section className="experience">
              <h2>Work Experience</h2>
              <div className="experience-grid">
                {workExperience.map((exp) => (
                  exp.position && (
                    <div key={exp.id} className="exp-card">
                      <h3>{exp.position}</h3>
                      <p className="meta">{exp.company} • {exp.startDate} — {exp.endDate}</p>
                      <p className="meta">{exp.location}</p>
                      {exp.description.length > 0 && exp.description[0] && (
                        <ul>
                          {exp.description.map((desc, index) => (
                            desc.trim() && <li key={index}>{desc.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && education[0].degree && (
            <section className="education">
              <h2>Education</h2>
              {education.map((edu) => (
                edu.degree && (
                  <p key={edu.id}>{edu.degree} — {edu.institution} — {edu.graduationYear}</p>
                )
              ))}
            </section>
          )}

          {certifications.length > 0 && certifications[0] && (
            <section className="certifications">
              <h2>Certifications</h2>
              <ul>
                {certifications.map((cert, index) => (
                  cert.trim() && <li key={index}>{cert.trim()}</li>
                ))}
              </ul>
            </section>
          )}

          {awards.length > 0 && awards[0] && (
            <section className="awards">
              <h2>Awards</h2>
              <ul>
                {awards.map((award, index) => (
                  award.trim() && <li key={index}>{award.trim()}</li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </article>
    );
  }

  // Default layout (layout-2, layout-5 and others use single column structure)
  return (
    <article className={`resume ${layoutClass}`} style={{ '--accent': themeColor } as React.CSSProperties}>
      <header className="r-header">
        <h1 className="name">{personalInfo.fullName || 'Your Name'}</h1>
        <p className="tagline">{getContactInfo()}</p>
      </header>

      <main>
        {summary && (
          <section className="summary">
            <h2>Professional Summary</h2>
            <p>{summary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section className="skills">
            <h2>Skills</h2>
            <ul className="skill-list">
              {skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </section>
        )}

        {workExperience.length > 0 && workExperience[0].position && (
          <section className="experience">
            <h2>Work Experience</h2>
            {workExperience.map((exp) => (
              exp.position && (
                <article key={exp.id} className="job">
                  <h3 className="job-title">{exp.position} — {exp.company}</h3>
                  <p className="job-meta">{exp.startDate} — {exp.endDate} • {exp.location}</p>
                  {exp.description.length > 0 && exp.description[0] && (
                    <ul>
                      {exp.description.map((desc, index) => (
                        desc.trim() && <li key={index}>{desc.trim()}</li>
                      ))}
                    </ul>
                  )}
                </article>
              )
            ))}
          </section>
        )}

        {education.length > 0 && education[0].degree && (
          <section className="education">
            <h2>Education</h2>
            {education.map((edu) => (
              edu.degree && (
                <div key={edu.id}>
                  <p><strong>{edu.degree}</strong> — {edu.institution} — {edu.graduationYear}</p>
                  {edu.gpa && <p>GPA: {edu.gpa}</p>}
                  {edu.projects && (
                    <div>
                      <strong>Projects:</strong>
                      <ul>
                        {edu.projects.split('\n').map((project, idx) => (
                          project.trim() && <li key={idx}>{project.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            ))}
          </section>
        )}

        {certifications.length > 0 && certifications[0] && (
          <section className="certifications">
            <h2>Certifications</h2>
            <ul>
              {certifications.map((cert, index) => (
                cert.trim() && <li key={index}>{cert.trim()}</li>
              ))}
            </ul>
          </section>
        )}

        {awards.length > 0 && awards[0] && (
          <section className="awards">
            <h2>Awards</h2>
            <ul>
              {awards.map((award, index) => (
                award.trim() && <li key={index}>{award.trim()}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </article>
  );
};