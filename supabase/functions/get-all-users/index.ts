
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Verify the requesting user is a super admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Get the user from the auth header
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if the requesting user is a super admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .single()

    if (adminError || !adminData?.is_super_admin) {
      return new Response(
        JSON.stringify({ success: false, message: 'Apenas super administradores podem acessar essa função' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Get all users from auth
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUsersError) {
      return new Response(
        JSON.stringify({ success: false, message: `Erro ao listar usuários: ${authUsersError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Map users to a simplified format
    const users = authUsers.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_login: user.last_sign_in_at,
      is_active: !user.banned_until
    }))

    return new Response(
      JSON.stringify(users),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
