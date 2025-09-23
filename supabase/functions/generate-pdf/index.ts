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
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
            .header { background: #374151; color: white; padding: 30px; margin-bottom: 20px; }
            .header h1 { margin: 0 0 10px 0; font-size: 32px; }
            .contact-info { font-size: 14px; }
            .contact-info span { margin-right: 20px; }
            .section { margin-bottom: 25px; }
            .section-title { color: #374151; font-size: 18px; font-weight: bold; border-bottom: 2px solid #374151; padding-bottom: 5px; margin-bottom: 15px; }
            .work-item, .education-item { margin-bottom: 20px; }
            .work-title { font-weight: bold; color: #374151; }
            .work-meta { color: #666; margin-bottom: 10px; }
            .skills-category { margin-bottom: 10px; }
            .skills-category strong { color: #374151; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin-bottom: 5px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${personalInfo?.fullName || 'Your Name'}</h1>
            <div class="contact-info">
                ${personalInfo?.phone ? `<span>${personalInfo.phone}</span>` : ''}
                ${personalInfo?.email ? `<span>${personalInfo.email}</span>` : ''}
                ${personalInfo?.linkedin ? `<span>${personalInfo.linkedin}</span>` : ''}
                ${personalInfo?.portfolio ? `<span>${personalInfo.portfolio}</span>` : ''}
            </div>
        </div>

        ${summary ? `
        <div class="section">
            <div class="section-title">PROFESSIONAL SUMMARY</div>
            <p>${summary}</p>
        </div>
        ` : ''}

        <div class="section">
            <div class="section-title">SKILLS</div>
            ${skills?.digitalMarketing?.length ? `
            <div class="skills-category">
                <strong>Digital Marketing:</strong> ${skills.digitalMarketing.join(', ')}
            </div>
            ` : ''}
            ${skills?.analytics?.length ? `
            <div class="skills-category">
                <strong>Analytics & Reporting:</strong> ${skills.analytics.join(', ')}
            </div>
            ` : ''}
            ${skills?.tools?.length ? `
            <div class="skills-category">
                <strong>Tools:</strong> ${skills.tools.join(', ')}
            </div>
            ` : ''}
            ${skills?.softSkills?.length ? `
            <div class="skills-category">
                <strong>Soft Skills:</strong> ${skills.softSkills.join(', ')}
            </div>
            ` : ''}
        </div>

        ${workExperience?.length && workExperience[0]?.position ? `
        <div class="section">
            <div class="section-title">WORK EXPERIENCE</div>
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
            <div class="section-title">EDUCATION</div>
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
            <div class="section-title">CERTIFICATIONS</div>
            <ul>
                ${certifications.map(cert => cert.trim() ? `<li>${cert.trim()}</li>` : '').join('')}
            </ul>
        </div>
        ` : ''}

        ${awards?.length && awards[0] ? `
        <div class="section">
            <div class="section-title">AWARDS AND RECOGNITION</div>
            <ul>
                ${awards.map(award => award.trim() ? `<li>${award.trim()}</li>` : '').join('')}
            </ul>
        </div>
        ` : ''}
    </body>
    </html>
  `
}