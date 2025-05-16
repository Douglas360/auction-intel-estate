
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
    
    // Get token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    
    // Check if user is an admin
    const { data: adminData } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()
      
    if (!adminData) {
      return new Response(
        JSON.stringify({ success: false, message: 'Apenas administradores podem acessar essa função' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    // Get all admin users
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (adminError) {
      return new Response(
        JSON.stringify({ success: false, message: `Erro ao listar administradores: ${adminError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Get emails for each admin user
    const enrichedAdmins = await Promise.all(adminUsers.map(async (admin) => {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(admin.user_id)
      
      return {
        ...admin,
        user_email: userData?.user?.email || 'Email não encontrado'
      }
    }))
    
    return new Response(
      JSON.stringify(enrichedAdmins),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
