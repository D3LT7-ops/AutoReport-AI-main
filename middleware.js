import { NextResponse } from 'next/server'

const ROTAS_PROTEGIDAS = ['/dashboard','/vendas','/financeiro','/relatorios','/planos','/configuracoes']

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const isProtected = ROTAS_PROTEGIDAS.some(r => pathname.startsWith(r))
  if (!isProtected) return NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return NextResponse.next()

  const cookieName  = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  const cookieValue = request.cookies.get(cookieName)?.value

  if (!cookieValue) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'],
}
