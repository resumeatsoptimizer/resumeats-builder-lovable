import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { resumeData, targetLanguage } = await req.json();

    if (!resumeData || !targetLanguage) {
      return new Response(JSON.stringify({ error: 'Missing resumeData or targetLanguage parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch user profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!profile || profile.credits < 5) {
      return new Response(JSON.stringify({ error: 'Insufficient credits. Translation requires 5 credits.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decrement user credits before calling AI (as specified in roadmap)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - 5 })
      .eq('id', user.id);

    if (updateError) {
      console.error('Credits update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update credits' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call OpenRouter.ai API
    const prompt = `Translate every field in the following JSON object into ${targetLanguage}. Maintain the original JSON structure and keys. Do not translate the keys, only translate the values. Ensure all text content is accurately translated while preserving professional resume terminology. Return only the translated JSON object without any additional text or explanation. Here is the JSON: ${JSON.stringify(resumeData)}`;

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://resume-ats-builder.com',
        'X-Title': 'ResumeATS-Builder'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.2
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      // Refund credits on API failure
      await supabase
        .from('profiles')
        .update({ credits: profile.credits })
        .eq('id', user.id);
      
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openRouterData = await openRouterResponse.json();
    const translatedText = openRouterData.choices[0]?.message?.content;

    if (!translatedText) {
      // Refund credits on no response
      await supabase
        .from('profiles')
        .update({ credits: profile.credits })
        .eq('id', user.id);
        
      return new Response(JSON.stringify({ error: 'No translation received' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the translated JSON
    let translatedResumeData;
    try {
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = translatedText.match(/\{.*\}/s);
      const jsonString = jsonMatch ? jsonMatch[0] : translatedText;
      translatedResumeData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response:', translatedText);
      // Refund credits on parse failure
      await supabase
        .from('profiles')
        .update({ credits: profile.credits })
        .eq('id', user.id);
        
      return new Response(JSON.stringify({ error: 'Failed to parse translated data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`AI translation completed for user ${user.id}, target language: ${targetLanguage}, credits remaining: ${profile.credits - 5}`);

    return new Response(JSON.stringify({ 
      translatedResumeData,
      creditsRemaining: profile.credits - 5,
      targetLanguage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-translate function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});