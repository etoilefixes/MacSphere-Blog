
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "请输入用户名。" }),
  password: z.string().min(1, { message: "请输入密码。" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// Placeholder for roles that would come from a backend
const ADMIN_ROLE_USERNAME = "root"; 
const EDITOR_ROLE_USERNAME = "editor";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    setRedirectUrl(searchParams.get('redirectUrl'));
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoggingIn(true);
    
    // Simulate API call to backend for authentication
    // In a real app:
    // try {
    //   const response = await fetch('/api/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    //   });
    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || "登录失败");
    //   }
    //   const session = await response.json(); // { user, token, role }
    //   localStorage.setItem('loggedInUser', session.user.username);
    //   localStorage.setItem('userRole', session.user.role); // Store role for client-side UI adjustments
    //   // Securely store session token (e.g., in HttpOnly cookie handled by backend)
    //   toast({ title: "登录成功", description: `欢迎回来，${session.user.username}！正在跳转...` });
    //   router.push(redirectUrl || (session.user.role === 'admin' || session.user.role === 'editor' ? '/admin' : '/'));
    // } catch (error: any) {
    //   toast({ title: "登录失败", description: error.message, variant: "destructive" });
    // } finally {
    //   setIsLoggingIn(false);
    // }

    // --- Start of Simulation (for UI demonstration without backend) ---
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    // For this prototype, we'll simulate a successful login for any non-empty username/password
    // And store username in localStorage to mimic a session.
    // In a real app, backend would validate credentials against a database.
    if (data.username && data.password) {
      localStorage.setItem('loggedInUser', data.username);
      // Simulate role for admin/editor for UI demonstration
      if (data.username === ADMIN_ROLE_USERNAME) {
        localStorage.setItem('userRole', 'admin');
      } else if (data.username === EDITOR_ROLE_USERNAME) {
        localStorage.setItem('userRole', 'editor');
      } else {
        localStorage.setItem('userRole', 'user');
      }

      toast({
        title: "登录成功",
        description: `欢迎回来，${data.username}！正在跳转...`,
      });
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (data.username === ADMIN_ROLE_USERNAME || data.username === EDITOR_ROLE_USERNAME) {
        router.push('/admin'); 
      } else {
        router.push('/');
      }
    } else {
      toast({
        title: "登录失败",
        description: "用户名或密码错误。", // Generic error
        variant: "destructive",
      });
    }
    setIsLoggingIn(false);
    // --- End of Simulation ---
  }

  const registerLinkPath = redirectUrl ? `/register?redirectUrl=${encodeURIComponent(redirectUrl)}` : '/register';

  return (
    <div className="flex min-h-screen items-center justify-center py-12 animate-genie-in">
      <Card className="w-full max-w-md glassmorphic glassmorphic-fallback-noise shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">用户登录</CardTitle>
          <CardDescription>请输入您的凭据以继续。</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input placeholder="输入您的用户名" {...field} disabled={isLoggingIn} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="输入您的密码" {...field} disabled={isLoggingIn} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
               <Button type="submit" disabled={isLoggingIn} className="w-full button-spring">
                <LogIn className="mr-2 h-5 w-5" />
                {isLoggingIn ? "登录中..." : "登录"}
              </Button>
              <p className="text-sm text-muted-foreground">
                还没有账户？{' '}
                <Link href={registerLinkPath} className="font-medium text-primary hover:underline">
                  <UserPlus className="inline mr-1 h-4 w-4" />
                  点此注册
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
         <CardContent className="mt-2 text-center">
             <p className="text-xs text-muted-foreground">
                提示：管理员账户: <span className="font-mono">root</span> / <span className="font-mono">任意密码</span>
            </p>
             <p className="text-xs text-muted-foreground">
                提示：编辑账户: <span className="font-mono">editor</span> / <span className="font-mono">任意密码</span>
            </p>
            <p className="text-xs text-destructive mt-1">
                重要：用户认证和数据存储需要后端实现。当前为前端演示。
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
