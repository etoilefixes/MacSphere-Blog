
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

// Predefined special accounts
const ADMIN_USERNAME = "root"; 
const ADMIN_PASSWORD = "123456"; 
const EDITOR_USERNAME = "editor";
const EDITOR_PASSWORD = "editor123";

// Ensure predefined accounts are in localStorage on first load if not present
if (typeof window !== 'undefined') {
  const existingUsersRaw = localStorage.getItem('blogUsers');
  let users = existingUsersRaw ? JSON.parse(existingUsersRaw) : {};
  if (!users[ADMIN_USERNAME]) {
    users[ADMIN_USERNAME] = ADMIN_PASSWORD;
  }
  if (!users[EDITOR_USERNAME]) {
    users[EDITOR_USERNAME] = EDITOR_PASSWORD;
  }
  localStorage.setItem('blogUsers', JSON.stringify(users));
}


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    setRedirectUrl(searchParams.get('redirectUrl'));
    // Optionally clear any existing session when the login page is loaded, or handle this more gracefully
    // For now, let's keep it simple and not auto-logout if user navigates here while logged in.
    // They can log out via a dedicated logout mechanism if needed.
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
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call

    if (typeof window !== 'undefined') {
      const existingUsersRaw = localStorage.getItem('blogUsers');
      const users = existingUsersRaw ? JSON.parse(existingUsersRaw) : {};

      if (users[data.username] && users[data.username] === data.password) {
        localStorage.setItem('loggedInUser', data.username);
        toast({
          title: "登录成功",
          description: `欢迎回来，${data.username}！正在跳转...`,
        });
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (data.username === ADMIN_USERNAME || data.username === EDITOR_USERNAME) {
          router.push('/admin'); 
        } else {
          router.push('/');
        }
      } else {
        toast({
          title: "登录失败",
          description: "用户名或密码错误。",
          variant: "destructive",
        });
        // localStorage.removeItem('loggedInUser'); // Only remove if login fails for security
      }
    } else {
       toast({
        title: "登录失败",
        description: "无法访问本地存储。",
        variant: "destructive",
      });
    }
    setIsLoggingIn(false);
  }

  const registerLink = redirectUrl ? `/register?redirectUrl=${encodeURIComponent(redirectUrl)}` : '/register';

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
                      <Input placeholder="输入您的用户名" {...field} />
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
                      <Input type="password" placeholder="输入您的密码" {...field} />
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
                <Link href={registerLink} className="font-medium text-primary hover:underline">
                  <UserPlus className="inline mr-1 h-4 w-4" />
                  点此注册
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
         <CardContent className="mt-2 text-center">
             <p className="text-xs text-muted-foreground">
                提示：管理员 <span className="font-mono">root</span> / <span className="font-mono">123456</span>
            </p>
             <p className="text-xs text-muted-foreground">
                提示：编辑 <span className="font-mono">editor</span> / <span className="font-mono">editor123</span>
            </p>
            <p className="text-xs text-destructive mt-1">
                重要：此为演示用前端认证，用户数据存储在浏览器本地，并不安全。请勿在生产环境中使用。
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
