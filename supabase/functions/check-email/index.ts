import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckEmailRequest {
  email: string;
}

interface CheckEmailResponse {
  status: 'not_registered' | 'registered_unverified' | 'registered_verified';
  email: string;
  createdAt?: string;
  lastSignInAt?: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email }: CheckEmailRequest = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({
          error: 'Invalid email format',
          message: '请提供有效的邮箱地址'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Checking email status for:', email)

    // Use Supabase Admin API to properly check user status
    console.log('Checking email using Admin API for:', email);

    let response: CheckEmailResponse;

    try {
      // Use admin.listUsers to search for the user - get more users to filter manually
      const { data: users, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 100
      });

      console.log('Admin API result:', { totalUsers: users?.users?.length || 0, error: listError });

      if (listError) {
        console.error('Admin API error:', listError);
        throw listError;
      }

      // Manually filter for exact email match (case insensitive)
      const exactUser = users?.users?.find(user =>
        user.email && user.email.toLowerCase() === email.toLowerCase()
      );

      if (exactUser) {
        // User found, check verification status
        response = {
          status: exactUser.email_confirmed_at ? 'registered_verified' : 'registered_unverified',
          email,
          createdAt: exactUser.created_at,
          lastSignInAt: exactUser.last_sign_in_at,
          message: exactUser.email_confirmed_at
            ? '邮箱已注册且已验证，可以直接登录'
            : '邮箱已注册但未验证，请检查邮件或重新发送验证邮件'
        };

        console.log('Exact user found:', response);
      } else {
        // User not found
        response = {
          status: 'not_registered',
          email,
          message: '邮箱可以注册'
        };
        console.log('User not found');
      }

    } catch (adminError) {
      console.error('Error during Admin API check:', adminError);

      // Fallback to safer assumption if Admin API fails
      response = {
        status: 'not_registered',
        email,
        message: '邮箱可以注册'
      };
    }

    console.log('Email status check result:', response)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error checking email status:', error)

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: '检查邮箱状态时发生错误，请稍后重试'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})