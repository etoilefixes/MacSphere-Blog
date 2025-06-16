
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Placeholders for roles that would come from a backend session/token
const ADMIN_ROLE = "admin";
const EDITOR_ROLE = "editor";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setIsCheckingAuth(false);
      setIsAuthorized(true); 
      return;
    }

    setIsCheckingAuth(true);
    let userIsAuthorized = false;
    if (typeof window !== 'undefined') {
        // In a real app, you'd verify a session token with the backend.
        // For this frontend-only demo, we check a role stored in localStorage during simulated login.
        const userRole = localStorage.getItem('userRole'); 
        if (userRole && (userRole === ADMIN_ROLE || userRole === EDITOR_ROLE)) {
          userIsAuthorized = true;
        }
    }
    
    setIsAuthorized(userIsAuthorized);
    if (!userIsAuthorized) {
      const loginRedirectParams = new URLSearchParams();
      loginRedirectParams.set('redirectUrl', pathname);
      router.replace(`/login?${loginRedirectParams.toString()}`);
    }
    setIsCheckingAuth(false);
  }, [pathname, router]);

  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>; 
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">正在验证访问权限...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-destructive">访问后台管理区权限不足。正在重定向到登录页面...</p>
      </div>
    );
  }

  return <>{children}</>;
}
