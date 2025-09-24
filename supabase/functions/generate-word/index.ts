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

    // First check if the resume is public or belongs to the authenticated user
    const { data: resume, error: resumeError } = await supabaseClient
      .from('resumes')
      .select('*')
      .eq('id', resume_id)
      .single()

    if (resumeError || !resume) {
      return new Response(
        JSON.stringify({ error: 'Resume not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If resume is not public, verify user authentication
    if (!resume.is_public) {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
      
      if (userError || !user || user.id !== resume.user_id) {
        return new Response(
          JSON.stringify({ error: 'Access denied - Resume is private' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Generate Word document content
    const wordContent = generateWordDocument(resume.resume_data, resume.template_name, resume.theme_color)
    
    // Convert to base64 for transfer
    const base64Content = btoa(wordContent)

    return new Response(
      JSON.stringify({ 
        success: true, 
        wordBlob: base64Content,
        message: 'Word document generated successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-word function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateWordDocument(resumeData: any, templateName: string, themeColor: string = '#3b82f6'): string {
  const { personalInfo, summary, skills, workExperience, education, certifications, awards } = resumeData

  // Translation function (simplified for Word)
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

  // Generate Word HTML content that can be saved as .docx
  // This creates a basic HTML structure that Microsoft Word can interpret
  const wordHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="UTF-8">
        <title>Resume - ${personalInfo?.fullName || 'Resume'}</title>
        <!--[if gte mso 9]>
        <xml>
            <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>90</w:Zoom>
                <w:DoNotPromptForConvert/>
                <w:DoNotShowInsertionsAndDeletions/>
            </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
            @page {
                size: 8.5in 11in;
                margin: 1in;
            }
            body {
                font-family: 'Calibri', 'Arial', sans-serif;
                font-size: 11pt;
                line-height: 1.15;
                color: #000000;
                margin: 0;
                padding: 0;
            }
            .header {
                text-align: center;
                margin-bottom: 20pt;
                padding-bottom: 10pt;
                border-bottom: 2pt solid #000000;
            }
            .name {
                font-size: 22pt;
                font-weight: bold;
                margin-bottom: 8pt;
            }
            .contact-info {
                font-size: 10pt;
                line-height: 1.2;
                margin-bottom: 4pt;
            }
            .section-title {
                font-size: 14pt;
                font-weight: bold;
                text-transform: uppercase;
                margin-top: 16pt;
                margin-bottom: 8pt;
                border-bottom: 1pt solid #000000;
                padding-bottom: 2pt;
            }
            .work-item, .education-item {
                margin-bottom: 12pt;
                page-break-inside: avoid;
            }
            .work-title {
                font-weight: bold;
                font-size: 11pt;
                margin-bottom: 2pt;
            }
            .work-meta {
                font-size: 10pt;
                color: #666666;
                margin-bottom: 4pt;
            }
            ul {
                margin: 4pt 0 8pt 20pt;
                padding: 0;
            }
            li {
                margin-bottom: 2pt;
                font-size: 10pt;
            }
            p {
                margin: 4pt 0;
                text-align: justify;
            }
            .skills-list {
                margin: 4pt 0;
            }
            .skill-item {
                display: inline-block;
                margin-right: 8pt;
                margin-bottom: 4pt;
                padding: 2pt 6pt;
                border: 1pt solid #cccccc;
                font-size: 9pt;
            }
        </style>
    </head>
    <body>
        <!-- Header Section -->
        <div class="header">
            <div class="name">
                ${personalInfo?.prefix ? `${personalInfo.prefix} ` : ''}${personalInfo?.fullName || 'Your Name'}${personalInfo?.age ? ` ${t('editor.age')} ${personalInfo.age} ${t('editor.years')}` : ''}
            </div>
            ${(personalInfo?.phone || personalInfo?.email) ? `
            <div class="contact-info">
                ${t('editor.phone')}: ${personalInfo.phone || ''}, ${t('editor.email')}: ${personalInfo.email || ''}
            </div>` : ''}
            ${personalInfo?.linkedin ? `
            <div class="contact-info">LinkedIn: ${personalInfo.linkedin}</div>` : ''}
            ${personalInfo?.portfolio ? `
            <div class="contact-info">Portfolio: ${personalInfo.portfolio}</div>` : ''}
            ${personalInfo?.website ? `
            <div class="contact-info">${t('editor.website')}: ${personalInfo.website}</div>` : ''}
            ${personalInfo?.address ? `
            <div class="contact-info">${t('editor.address')}: ${personalInfo.address}</div>` : ''}
        </div>

        <!-- Professional Summary -->
        ${summary ? `
        <div class="section-title">${t('professionalSummary').toUpperCase()}</div>
        <p>${summary}</p>` : ''}

        <!-- Skills -->
        ${skills?.length ? `
        <div class="section-title">${t('skills').toUpperCase()}</div>
        <div class="skills-list">
            ${skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
        </div>` : ''}

        <!-- Work Experience -->
        ${workExperience?.length && workExperience[0]?.position ? `
        <div class="section-title">${t('workExperience').toUpperCase()}</div>
        ${workExperience.map(exp => `
            <div class="work-item">
                <div class="work-title">${exp.position} | ${exp.company}</div>
                <div class="work-meta">${exp.location} | ${exp.startDate} – ${exp.endDate}</div>
                ${exp.description?.length ? `
                <ul>
                    ${exp.description.map(desc => desc.trim() ? `<li>${desc.trim()}</li>` : '').join('')}
                </ul>` : ''}
            </div>
        `).join('')}` : ''}

        <!-- Education -->
        ${education?.length && education[0]?.degree ? `
        <div class="section-title">${t('education').toUpperCase()}</div>
        ${education.map(edu => `
            <div class="education-item">
                <div class="work-title">${edu.degree}</div>
                <div class="work-meta">${edu.institution} | ${edu.location} | ${edu.graduationYear}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                ${edu.projects ? `
                <ul>
                    ${edu.projects.split('\n').map(project => project.trim() ? `<li>${project.trim()}</li>` : '').join('')}
                </ul>` : ''}
            </div>
        `).join('')}` : ''}

        <!-- Certifications -->
        ${certifications?.length && certifications[0] ? `
        <div class="section-title">${t('certifications').toUpperCase()}</div>
        <ul>
            ${certifications.map(cert => cert.trim() ? `<li>${cert.trim()}</li>` : '').join('')}
        </ul>` : ''}

        <!-- Awards -->
        ${awards?.length && awards[0] ? `
        <div class="section-title">${t('awards').toUpperCase()}</div>
        <ul>
            ${awards.map(award => award.trim() ? `<li>${award.trim()}</li>` : '').join('')}
        </ul>` : ''}

    </body>
    </html>
  `

  return wordHTML
}