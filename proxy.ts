import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

async function getSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value

  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    const session = await getSession(token)
    if (!session) return NextResponse.redirect(new URL('/login', request.url))
    if (!session.is_admin) return NextResponse.redirect(new URL('/catalogo', request.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/catalogo') || pathname.startsWith('/pedido')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    const session = await getSession(token)
    if (!session) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/catalogo/:path*', '/pedido/:path*', '/admin/:path*'],
}
