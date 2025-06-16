
'use client';

import Link from 'next/link';
import { MacSphereLogo } from '@/components/icons/MacSphereLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserPlus } from 'lucide-react'; // UserCircle removed for simplicity, admin link logic changed
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

const ADMIN_ROLE = "admin"; // Placeholder role name
const EDITOR_ROLE = "editor"; // Placeholder role name

export function NavigationBar() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // For UI conditional rendering
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const updateUserState = () => {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('loggedInUser');
        const role = localStorage.getItem('userRole');
        setLoggedInUser(user);
        setUserRole(role);
      }
    };

    updateUserState(); // Initial check

    // Listen for storage changes to update UI if login/logout happens in another tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'loggedInUser' || event.key === 'userRole') {
        updateUserState();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Re-check on pathname change, useful if user logs in/out and navigates
  useEffect(() => {
     if (typeof window !== 'undefined') {
      setLoggedInUser(localStorage.getItem('loggedInUser'));
      setUserRole(localStorage.getItem('userRole'));
    }
  }, [pathname]);


  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('userRole'); // Clear simulated role
    }
    setLoggedInUser(null);
    setUserRole(null);
    toast({title: "已登出", description: "您已成功退出登录。"});
    router.push('/'); 
    router.refresh(); 
  };
  
  const loginLinkPath = `/login?redirectUrl=${encodeURIComponent(pathname)}`;
  const registerLinkPath = `/register?redirectUrl=${encodeURIComponent(pathname)}`;


  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between glassmorphic rounded-b-lg my-2 px-6 shadow-lg glassmorphic-fallback-noise">
          <Link href="/" className="flex items-center gap-3">
            <MacSphereLogo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground font-headline">
              MacSphere 博客
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-6 text-lg font-medium">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors nav-link-interactive">
                首页
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors nav-link-interactive">
                关于
              </Link>
              {(userRole === ADMIN_ROLE || userRole === EDITOR_ROLE) && (
                <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors nav-link-interactive">
                  管理后台
                </Link>
              )}
            </nav>
            {loggedInUser ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden md:inline">欢迎, {loggedInUser}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="button-spring">
                  <LogOut className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">登出</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="button-spring">
                  <Link href={loginLinkPath}>
                    <LogIn className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">登录</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="button-spring">
                  <Link href={registerLinkPath}>
                    <UserPlus className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">注册</span>
                  </Link>
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
