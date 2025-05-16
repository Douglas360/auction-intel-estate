
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
        JSON.stringify({ success: false, message: 'Apenas super administradores podem gerenciar usuários' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Get the target user ID and new status from the request body
    const { user_id, is_active } = await req.json()
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID do usuário não fornecido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Update the user's status in Supabase Auth
    if (is_active) {
      // Unban the user
      const { error: unbanError } = await supabaseAdmin.auth.admin.unlockUser(user_id)
      if (unbanError) {
        return new Response(
          JSON.stringify({ success: false, message: `Erro ao ativar usuário: ${unbanError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    } else {
      // Ban the user indefinitely
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { ban_duration: 'none' }
      )
      if (banError) {
        return new Response(
          JSON.stringify({ success: false, message: `Erro ao inativar usuário: ${banError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: true, is_active }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
