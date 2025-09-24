import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Set the auth token
    supabaseClient.auth.getUser(token)

    const { resume_id } = await req.json()

    if (!resume_id) {
      return new Response(
        JSON.stringify({ error: 'Missing resume_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the resume belongs to the authenticated user
    const { data: resume, error: resumeError } = await supabaseClient
      .from('resumes')
      .select('*')
      .eq('id', resume_id)
      .single()

    if (resumeError || !resume) {
      return new Response(
        JSON.stringify({ error: 'Resume not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate HTML content for the resume with template and theme
    const htmlContent = generateResumeHTML(resume.resume_data, resume.template_name, resume.theme_color)

    // Use Deno's built-in fetch to call a PDF generation service
    // For now, we'll return the HTML content and let the frontend handle PDF generation
    // In production, you could integrate with services like Puppeteer or Playwright
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        html: htmlContent,
        message: 'PDF generation endpoint ready. Integrate with Puppeteer service for actual PDF generation.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-pdf function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateResumeHTML(resumeData: any, templateName: string, themeColor: string = '#3b82f6'): string {
  const { personalInfo, summary, skills, workExperience, education, certifications, awards } = resumeData

  // Get theme color styles
  const getThemeColors = () => {
    const hexColor = themeColor?.startsWith('#') ? themeColor : '#3b82f6'
    
    if (templateName === 'Corporate') {
      return {
        headerStyle: 'background: transparent;',
        accentColor: '#000000',
        headerTextColor: '#000000'
      }
    }
    
    return {
      headerStyle: `background: linear-gradient(135deg, ${hexColor}dd, ${hexColor});`,
      accentColor: hexColor,
      headerTextColor: '#ffffff'
    }
  }

  const colors = getThemeColors()
  
  // Translation function (simplified for PDF)
  const t = (key: string) => {
    const translations: { [key: string]: string } = {
      'professionalSummary': 'สรุปประสบการณ์',
      'skills': 'ความสามารถ/ทักษะ', 
      'workExperience': 'ประสบการณ์ทำงาน',
      'education': 'การศึกษา',
      'certifications': 'ใบรับรอง',
      'awards': 'รางวัลและเกียรติยศ',
      'editor.age': 'อายุ',
      'editor.years': 'ปี',
      'editor.phone': 'โทรศัพท์',
      'editor.email': 'อีเมล',
      'editor.website': 'เว็บไซต์',
      'editor.address': 'ที่อยู่'
    }
    return translations[key] || key
  }

  // Creative template layout (2 columns)
  if (templateName === 'Creative') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Resume - ${personalInfo?.fullName || 'Resume'}</title>
          <style>
              @page { size: A4; margin: 0.5in; }
              * { box-sizing: border-box; }
              body { 
                  font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif; 
                  margin: 0; padding: 0; color: #0f172a; line-height: 1.45; 
                  font-size: 11px; max-width: 100%; overflow-wrap: break-word;
              }
              .resume { max-width: 816px; margin: 0 auto; background: white; padding: 24px; }
              .header { 
                  ${colors.headerStyle}
                  color: ${colors.headerTextColor}; 
                  padding: 20px; margin-bottom: 16px; border-radius: 6px;
                  display: flex; align-items: center; gap: 16px;
              }
              .header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 700; }
              .header h1 .prefix { font-size: 20px; }
              .header h1 .age { font-size: 22px; }
              .contact-info { font-size: 12px; line-height: 1.2; }
              .contact-info div { margin-bottom: 2px; }
              .main-content { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
              .section { margin-bottom: 16px; page-break-inside: avoid; }
              .section-title { 
                  color: ${colors.accentColor}; font-size: 14px; font-weight: 700; 
                  border-bottom: 2px solid ${colors.accentColor}; padding-bottom: 4px; 
                  margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;
              }
              .work-item, .education-item { margin-bottom: 14px; page-break-inside: avoid; }
              .work-title { font-weight: 600; color: ${colors.accentColor}; font-size: 12px; margin-bottom: 4px; }
              .work-meta { color: #64748b; margin-bottom: 8px; font-size: 10px; }
              .skills-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
              .skill-item {
                  background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 10px;
                  color: #334155; border: 1px solid ${colors.accentColor};
              }
              ul { margin: 8px 0; padding-left: 16px; }
              li { margin-bottom: 4px; font-size: 10px; }
              p { margin: 8px 0; font-size: 11px; }
              @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
      </head>
      <body>
          <div class="resume">
              <div class="header">
                  <div style="flex: 1;">
                      <h1>
                          <span class="prefix">${personalInfo?.prefix ? `${personalInfo.prefix} ` : ''}</span>
                          <span>${personalInfo?.fullName || 'Your Name'}</span>
                          <span class="age">${personalInfo?.age ? ` ${t('editor.age')} ${personalInfo.age} ${t('editor.years')}` : ''}</span>
                      </h1>
                      <div class="contact-info">
                          ${(personalInfo?.phone || personalInfo?.email) ? `<div>${t('editor.phone')}: ${personalInfo.phone || ''}, ${t('editor.email')}: ${personalInfo.email || ''}</div>` : ''}
                          ${personalInfo?.linkedin ? `<div>LinkedIn: ${personalInfo.linkedin}</div>` : ''}
                          ${personalInfo?.portfolio ? `<div>Portfolio: ${personalInfo.portfolio}</div>` : ''}
                          ${personalInfo?.website ? `<div>${t('editor.website')}: ${personalInfo.website}</div>` : ''}
                          ${personalInfo?.address ? `<div>${t('editor.address')}: ${personalInfo.address}</div>` : ''}
                      </div>
                  </div>
              </div>

              <div class="main-content">
                  <div class="left-column">
                      ${summary ? `
                      <div class="section">
                          <div class="section-title">${t('professionalSummary').toUpperCase()}</div>
                          <p>${summary}</p>
                      </div>
                      ` : ''}

                      ${workExperience?.length && workExperience[0]?.position ? `
                      <div class="section">
                          <div class="section-title">${t('workExperience').toUpperCase()}</div>
                          ${workExperience.map(exp => `
                              <div class="work-item">
                                  <div class="work-title">${exp.position} | ${exp.company}</div>
                                  <div class="work-meta">${exp.location}</div>
                                  <div class="work-meta">${exp.startDate} – ${exp.endDate}</div>
                                  ${exp.description?.length ? `
                                  <ul>
                                      ${exp.description.map(desc => desc.trim() ? `<li>${desc.trim()}</li>` : '').join('')}
                                  </ul>
                                  ` : ''}
                              </div>
                          `).join('')}
                      </div>
                      ` : ''}

                      ${certifications?.length && certifications[0] ? `
                      <div class="section">
                          <div class="section-title">${t('certifications').toUpperCase()}</div>
                          <ul>
                              ${certifications.map(cert => cert.trim() ? `<li>${cert.trim()}</li>` : '').join('')}
                          </ul>
                      </div>
                      ` : ''}
                  </div>

                  <div class="right-column">
                      ${skills?.length ? `
                      <div class="section">
                          <div class="section-title">${t('skills').toUpperCase()}</div>
                          <div class="skills-list">
                              ${skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                          </div>
                      </div>
                      ` : ''}

                      ${education?.length && education[0]?.degree ? `
                      <div class="section">
                          <div class="section-title">${t('education').toUpperCase()}</div>
                          ${education.map(edu => `
                              <div class="education-item">
                                  <div class="work-title">${edu.degree}</div>
                                  <div class="work-meta">${edu.institution} | ${edu.location} ${edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
                                  <div class="work-meta">${edu.graduationYear}</div>
                                  ${edu.projects ? `
                                  <ul>
                                      ${edu.projects.split('\n').map(project => project.trim() ? `<li>${project.trim()}</li>` : '').join('')}
                                  </ul>
                                  ` : ''}
                              </div>
                          `).join('')}
                      </div>
                      ` : ''}

                      ${awards?.length && awards[0] ? `
                      <div class="section">
                          <div class="section-title">${t('awards').toUpperCase()}</div>
                          <ul>
                              ${awards.map(award => award.trim() ? `<li>${award.trim()}</li>` : '').join('')}
                          </ul>
                      </div>
                      ` : ''}
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
  }

  // Default layout for Professional and Corporate templates
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Resume - ${personalInfo?.fullName || 'Resume'}</title>
        <style>
            @page { size: A4; margin: 0.5in; }
            * { box-sizing: border-box; }
            body { 
                font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif; 
                margin: 0; padding: 0; color: #0f172a; line-height: 1.45; 
                font-size: 11px; max-width: 100%; overflow-wrap: break-word;
            }
            .resume { max-width: 816px; margin: 0 auto; background: white; padding: 24px; }
            .header { 
                ${colors.headerStyle}
                color: ${colors.headerTextColor}; 
                padding: 20px; margin-bottom: 16px; border-radius: 6px;
                display: flex; align-items: center; gap: 16px;
            }
            .header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 700; }
            .header h1 .prefix { font-size: 20px; }
            .header h1 .age { font-size: 22px; }
            .contact-info { font-size: 12px; line-height: 1.2; }
            .contact-info div { margin-bottom: 2px; }
            .section { margin-bottom: 16px; page-break-inside: avoid; }
            .section-title { 
                color: ${colors.accentColor}; font-size: 14px; font-weight: 700; 
                border-bottom: 2px solid ${colors.accentColor}; padding-bottom: 4px; 
                margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;
            }
            .work-item, .education-item { margin-bottom: 14px; page-break-inside: avoid; }
            .work-title { font-weight: 600; color: ${colors.accentColor}; font-size: 12px; margin-bottom: 4px; }
            .work-meta { color: #64748b; margin-bottom: 8px; font-size: 10px; }
            .work-item-content { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
            .work-date { text-align: right; color: #64748b; font-size: 10px; }
            .education-item-content { display: flex; justify-content: space-between; align-items: start; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
            .skill-item {
                background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 10px;
                color: #334155; border: 1px solid ${colors.accentColor};
            }
            ul { margin: 8px 0; padding-left: 16px; }
            li { margin-bottom: 4px; font-size: 10px; }
            p { margin: 8px 0; font-size: 11px; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
    </head>
    <body>
        <div class="resume">
            <div class="header">
                <div style="flex: 1;">
                    <h1>
                        <span class="prefix">${personalInfo?.prefix ? `${personalInfo.prefix} ` : ''}</span>
                        <span>${personalInfo?.fullName || 'Your Name'}</span>
                        <span class="age">${personalInfo?.age ? ` ${t('editor.age')} ${personalInfo.age} ${t('editor.years')}` : ''}</span>
                    </h1>
                    <div class="contact-info">
                        ${(personalInfo?.phone || personalInfo?.email) ? `<div>${t('editor.phone')}: ${personalInfo.phone || ''}, ${t('editor.email')}: ${personalInfo.email || ''}</div>` : ''}
                        ${personalInfo?.linkedin ? `<div>LinkedIn: ${personalInfo.linkedin}</div>` : ''}
                        ${personalInfo?.portfolio ? `<div>Portfolio: ${personalInfo.portfolio}</div>` : ''}
                        ${personalInfo?.website ? `<div>${t('editor.website')}: ${personalInfo.website}</div>` : ''}
                        ${personalInfo?.address ? `<div>${t('editor.address')}: ${personalInfo.address}</div>` : ''}
                    </div>
                </div>
            </div>

            ${summary ? `
            <div class="section">
                <div class="section-title">${t('professionalSummary').toUpperCase()}</div>
                <p>${summary}</p>
            </div>
            ` : ''}

            ${skills?.length ? `
            <div class="section">
                <div class="section-title">${t('skills').toUpperCase()}</div>
                <div class="skills-list">
                    ${skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            ${workExperience?.length && workExperience[0]?.position ? `
            <div class="section">
                <div class="section-title">${t('workExperience').toUpperCase()}</div>
                ${workExperience.map(exp => `
                    <div class="work-item">
                        <div class="work-item-content">
                            <div>
                                <div class="work-title">${exp.position} | ${exp.company}</div>
                                <div class="work-meta">${exp.location}</div>
                            </div>
                            <div class="work-date">${exp.startDate} – ${exp.endDate}</div>
                        </div>
                        ${exp.description?.length ? `
                        <ul>
                            ${exp.description.map(desc => desc.trim() ? `<li>${desc.trim()}</li>` : '').join('')}
                        </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${education?.length && education[0]?.degree ? `
            <div class="section">
                <div class="section-title">${t('education').toUpperCase()}</div>
                ${education.map(edu => `
                    <div class="education-item">
                        <div class="education-item-content">
                            <div>
                                <div class="work-title">${edu.degree}</div>
                                <div class="work-meta">${edu.institution} | ${edu.location} ${edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
                                ${edu.projects ? `
                                <ul>
                                    ${edu.projects.split('\n').map(project => project.trim() ? `<li>${project.trim()}</li>` : '').join('')}
                                </ul>
                                ` : ''}
                            </div>
                            <div class="work-date">${edu.graduationYear}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${certifications?.length && certifications[0] ? `
            <div class="section">
                <div class="section-title">${t('certifications').toUpperCase()}</div>
                <ul>
                    ${certifications.map(cert => cert.trim() ? `<li>${cert.trim()}</li>` : '').join('')}
                </ul>
            </div>
            ` : ''}

            ${awards?.length && awards[0] ? `
            <div class="section">
                <div class="section-title">${t('awards').toUpperCase()}</div>
                <ul>
                    ${awards.map(award => award.trim() ? `<li>${award.trim()}</li>` : '').join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    </body>
    </html>
  `
}