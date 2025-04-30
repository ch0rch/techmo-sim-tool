// Este archivo ayuda a Vercel a generar correctamente el routes-manifest.json
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Este middleware no hace nada, pero su presencia puede ayudar a Vercel
  // a generar correctamente el routes-manifest.json
  return NextResponse.next()
}

// Configurar para que se ejecute en todas las rutas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
