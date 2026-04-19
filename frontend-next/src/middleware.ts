import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Pass-through for now — client-side auth guard in (app)/layout.tsx
  // handles route protection via useAuthStore + router.replace('/')
  return NextResponse.next();
}

export const config = {
  matcher: ['/builder/:path*', '/editor/:path*', '/analyzer/:path*', '/career/:path*'],
};
