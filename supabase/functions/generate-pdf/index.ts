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

    // Generate HTML content for the resume
    const htmlContent = generateResumeHTML(resume.resume_data, resume.template_name)

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

function generateResumeHTML(resumeData: any, templateName: string): string {
  const { personalInfo, summary, skills, workExperience, education, certifications, awards } = resumeData

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Resume - ${personalInfo?.fullName || 'Resume'}</title>
        <style>
            @page { 
                size: A4; 
                margin: 0.5in; 
            }
            * { 
                box-sizing: border-box; 
            }
            body { 
                font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                color: #0f172a; 
                line-height: 1.45; 
                font-size: 11px;
                max-width: 100%;
                overflow-wrap: break-word;
            }
            .resume { 
                max-width: 816px; 
                margin: 0 auto; 
                background: white; 
                padding: 24px; 
                min-height: 100vh;
            }
            .header { 
                background: #3b82f6; 
                color: white; 
                padding: 20px; 
                margin-bottom: 16px; 
                border-radius: 6px;
            }
            .header h1 { 
                margin: 0 0 8px 0; 
                font-size: 24px; 
                font-weight: 700;
            }
            .contact-info { 
                font-size: 12px; 
                line-height: 1.4;
            }
            .contact-info span { 
                margin-right: 16px; 
                display: inline-block;
            }
            .section { 
                margin-bottom: 16px; 
                page-break-inside: avoid;
            }
            .section-title { 
                color: #3b82f6; 
                font-size: 14px; 
                font-weight: 700; 
                border-bottom: 2px solid #3b82f6; 
                padding-bottom: 4px; 
                margin-bottom: 12px; 
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .work-item, .education-item { 
                margin-bottom: 14px; 
                page-break-inside: avoid;
            }
            .work-title { 
                font-weight: 600; 
                color: #0f172a; 
                font-size: 12px;
                margin-bottom: 4px;
            }
            .work-meta { 
                color: #64748b; 
                margin-bottom: 8px; 
                font-size: 10px;
            }
            .skills-list {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin: 8px 0;
            }
            .skill-item {
                background: #f1f5f9;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                color: #334155;
                border: 1px solid #e2e8f0;
            }
            ul { 
                margin: 8px 0; 
                padding-left: 16px; 
            }
            li { 
                margin-bottom: 4px; 
                font-size: 10px;
            }
            p {
                margin: 8px 0;
                font-size: 11px;
            }
            .two-column {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }
            @media print {
                body { 
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .resume {
                    padding: 16px;
                    min-height: auto;
                }
            }
        </style>
    </head>
    <body>
        <div class="resume">
            <div class="header">
                <h1 style="font-size: 28px; margin-bottom: 8px;">
                    <span style="font-size: 20px;">${personalInfo?.prefix ? `${personalInfo.prefix} ` : ''}</span>
                    <span style="font-size: 28px;">${personalInfo?.fullName || 'Your Name'}</span>
                    <span style="font-size: 22px;">${personalInfo?.age ? ` อายุ ${personalInfo.age} ปี` : ''}</span>
                </h1>
                <div class="contact-info" style="line-height: 1.2; font-size: 12px;">
                    ${(personalInfo?.phone || personalInfo?.email) ? `<div>โทรศัพท์: ${personalInfo.phone || ''}, อีเมล: ${personalInfo.email || ''}</div>` : ''}
                    ${personalInfo?.linkedin ? `<div>LinkedIn: ${personalInfo.linkedin}</div>` : ''}
                    ${personalInfo?.portfolio ? `<div>Portfolio: ${personalInfo.portfolio}</div>` : ''}
                    ${personalInfo?.website ? `<div>เว็บไซต์: ${personalInfo.website}</div>` : ''}
                    ${personalInfo?.address ? `<div>ที่อยู่: ${personalInfo.address}</div>` : ''}
                </div>
            </div>

            ${summary ? `
            <div class="section">
                <div class="section-title">สรุปประสบการณ์</div>
                <p>${summary}</p>
            </div>
            ` : ''}

            ${skills?.length ? `
            <div class="section">
                <div class="section-title">ความสามารถ/ทักษะ</div>
                <div class="skills-list">
                    ${skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                </div>
            </div>
            ` : ''}

        ${workExperience?.length && workExperience[0]?.position ? `
        <div class="section">
            <div class="section-title">ประสบการณ์ทำงาน</div>
            ${workExperience.map(exp => `
                <div class="work-item">
                    <div class="work-title">${exp.position} | ${exp.company}</div>
                    <div class="work-meta">${exp.location} | ${exp.startDate} – ${exp.endDate}</div>
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
            <div class="section-title">การศึกษา</div>
            ${education.map(edu => `
                <div class="education-item">
                    <div class="work-title">${edu.degree}</div>
                    <div class="work-meta">${edu.institution} | ${edu.location} | ${edu.graduationYear}</div>
                    ${edu.gpa ? `<div>• ${edu.gpa}</div>` : ''}
                    ${edu.projects ? `<div>• ${edu.projects}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${certifications?.length && certifications[0] ? `
        <div class="section">
            <div class="section-title">ใบรับรอง</div>
            <ul>
                ${certifications.map(cert => cert.trim() ? `<li>${cert.trim()}</li>` : '').join('')}
            </ul>
        </div>
        ` : ''}

        ${awards?.length && awards[0] ? `
        <div class="section">
            <div class="section-title">รางวัลและเกียรติยศ</div>
            <ul>
                ${awards.map(award => award.trim() ? `<li>${award.trim()}</li>` : '').join('')}
            </ul>
        </div>
        ` : ''}
    </body>
    </html>
  `
}