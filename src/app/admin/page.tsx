
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, Settings, Users, LogOut, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboardPage() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('loggedInUser'); // This is a placeholder for a real session
      setLoggedInUser(user);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('userRole'); // Clear simulated role
    }
    setLoggedInUser(null);
    toast({title: "已登出", description: "您已成功退出登录。"});
    router.push('/login'); 
  };

  return (
    <div className="container mx-auto py-8 animate-genie-in">
      <Card className="glassmorphic glassmorphic-fallback-noise shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle className="text-3xl font-headline">后台管理仪表盘</CardTitle>
                <CardDescription>欢迎，{loggedInUser || '管理员'}！请选择一个功能模块开始操作。</CardDescription>
            </div>
            <Button variant="outline" onClick={handleLogout} className="button-spring">
                <LogOut className="mr-2 h-4 w-4" /> 登出
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardLink
            href="/admin/articles"
            icon={<FileText className="h-10 w-10 text-primary" />}
            title="文章管理"
            description="创建、编辑和管理您的博客文章。"
          />
          <DashboardLink
            href="/admin/analytics"
            icon={<BarChart2 className="h-10 w-10 text-primary" />}
            title="网站分析"
            description="查看访客数据和网站统计（需后端）。"
          />
          <DashboardLink
            href="#" 
            icon={<Settings className="h-10 w-10 text-muted-foreground" />}
            title="系统设置 (待开发)"
            description="配置博客的各项参数和选项。"
            disabled
          />
          <DashboardLink
            href="#" 
            icon={<Users className="h-10 w-10 text-muted-foreground" />}
            title="用户管理 (待开发)"
            description="管理注册用户和评论者权限。"
            disabled
          />
           <DashboardLink
            href="/login" 
            icon={<UserCircle className="h-10 w-10 text-primary" />}
            title="切换账户"
            description="以不同身份登录或管理账户。"
          />
        </CardContent>
      </Card>
       <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-md text-sm text-blue-700 dark:text-blue-200">
          <strong>开发者提示：</strong> 后台功能（如用户管理、系统设置、真实分析数据）需要与后端服务集成。
      </div>
    </div>
  );
}

interface DashboardLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}

function DashboardLink({ href, icon, title, description, disabled = false }: DashboardLinkProps) {
  const content = (
    <Card className={`shadow-md hover:shadow-lg transition-shadow h-full flex flex-col ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-muted/20'}`}>
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        {icon}
        <CardTitle className="text-xl font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (disabled) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
