// ============================================================
// app/auth/callback/route.js
// NOVO: Rota chamada pelo Supabase após o usuário clicar no
//       link de confirmação de email ou recuperação de senha.
//
//       Fluxo:
//       1. Supabase envia email com link para /auth/callback?code=xxx
//       2. Esta rota troca o code por uma sessão ativa
//       3. Redireciona para /dashboard (ou /auth/nova-senha se for
//          recuperação de senha)
// ============================================================
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'recovery' para reset de senha
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // NOVO: troca o código de autorização por uma sessão válida
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Se for recuperação de senha, redireciona para tela de nova senha
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/nova-senha`)
      }
      // Senão, vai para o dashboard (email confirmado com sucesso)
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Auth callback error:', error.message)
  }

  // Link inválido ou expirado — redireciona com mensagem de erro
  return NextResponse.redirect(`${origin}/login?erro=link-invalido`)
}