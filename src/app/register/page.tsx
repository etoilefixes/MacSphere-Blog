
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from 'lucide-react'; // LogIn icon removed as it's not primary action here
import Link from 'next/link';

const registerFormSchema = z.object({
  username: z.string().min(3, { message: "用户名至少需要3个字符。" }).regex(/^[a-zA-Z0-9_]+$/, { message: "用户名只能包含字母、数字和下划线。" }),
  password: z.string().min(6, { message: "密码至少需要6个字符。" }),
  confirmPassword: z.string().min(6, { message: "请再次输入密码。" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致。",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

// Placeholder for reserved usernames that would be checked by backend
const RESERVED_USERNAMES = ["root", "editor", "admin"];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    setRedirectUrl(searchParams.get('redirectUrl'));
  }, [searchParams]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsRegistering(true);

    // Simulate API call to backend for registration
    // In a real app:
    // try {
    //   const response = await fetch('/api/register', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ username: data.username, password: data.password }),
    //   });
    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || "注册失败");
    //   }
    //   toast({ title: "注册成功！", description: `用户 ${data.username} 已成功注册。请登录。` });
    //   const loginRedirectParams = new URLSearchParams();
    //   if (redirectUrl) loginRedirectParams.set('redirectUrl', redirectUrl);
    //   router.push(`/login?${loginRedirectParams.toString()}`);
    // } catch (error: any) {
    //   toast({ title: "注册失败", description: error.message, variant: "destructive" });
    // } finally {
    //   setIsRegistering(false);
    // }

    // --- Start of Simulation (for UI demonstration without backend) ---
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    if (RESERVED_USERNAMES.includes(data.username.toLowerCase())) {
        toast({
          title: "注册失败",
          description: "该用户名已被占用或为保留账户，请选择其他用户名。",
          variant: "destructive",
        });
        setIsRegistering(false);
        return;
    }
    
    // Simulate successful registration
    toast({
        title: "注册成功！",
        description: `用户 ${data.username} 已成功注册。请登录。`,
    });
    
    const loginRedirectParamsPath = redirectUrl ? `/login?redirectUrl=${encodeURIComponent(redirectUrl)}` : '/login';
    router.push(loginRedirectParamsPath);
    // No localStorage interaction here for users; login page handles setting loggedInUser placeholder
    // --- End of Simulation ---
    
    setIsRegistering(false);
  }

  const loginLinkPath = redirectUrl ? `/login?redirectUrl=${encodeURIComponent(redirectUrl)}` : '/login';

  return (
    <div className="flex min-h-screen items-center justify-center py-12 animate-genie-in">
      <Card className="w-full max-w-md glassmorphic glassmorphic-fallback-noise shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">创建新账户</CardTitle>
          <CardDescription>填写以下信息以注册 MacSphere 博客账户。</CardDescription>
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
                      <Input placeholder="输入您的用户名" {...field} disabled={isRegistering} />
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
                      <Input type="password" placeholder="输入您的密码" {...field} disabled={isRegistering} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="再次输入您的密码" {...field} disabled={isRegistering} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" disabled={isRegistering} className="w-full button-spring">
                <UserPlus className="mr-2 h-5 w-5" />
                {isRegistering ? "注册中..." : "注册"}
              </Button>
              <p className="text-sm text-muted-foreground">
                已有账户？{' '}
                <Link href={loginLinkPath} className="font-medium text-primary hover:underline">
                  点此登录
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
         <CardContent className="mt-2 text-center">
            <p className="text-xs text-destructive mt-1">
                重要：用户注册和数据存储需要后端实现。当前为前端演示。
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
