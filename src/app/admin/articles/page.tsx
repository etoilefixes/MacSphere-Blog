
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllArticles, type Article } from '@/lib/articles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Heart, MessageCircle, Pencil, PlusCircle, AlertTriangle } from 'lucide-react';

interface ArticleDateCellProps {
  dateString: string;
}

function ArticleDateCell({ dateString }: ArticleDateCellProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // Ensure dateString is valid before attempting to parse
    if (dateString && !isNaN(new Date(dateString).getTime())) {
      setFormattedDate(new Date(dateString).toLocaleDateString('zh-CN'));
    } else if (dateString) {
      console.warn("Invalid date string received:", dateString);
      setFormattedDate("日期无效");
    }
  }, [dateString]);

  return <>{formattedDate || <span className="opacity-50">加载中...</span>}</>;
}


export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticles() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedArticles = await getAllArticles(); // Will now fetch from (non-existent) backend
        setArticles(fetchedArticles);
      } catch (e) {
        console.error("Failed to load articles for admin:", e);
        setError("无法加载文章列表。请确保后端服务正在运行并且可以访问。");
      }
      setIsLoading(false);
    }
    loadArticles();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">文章管理</CardTitle>
            <CardDescription>正在加载文章列表...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded w-full animate-pulse"></div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-genie-in">
      <Card className="glassmorphic glassmorphic-fallback-noise shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-headline">文章管理</CardTitle>
            <CardDescription>在这里查看和编辑您的博客文章。</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/articles/edit/new">
              <PlusCircle className="mr-2 h-5 w-5" /> 新建文章
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="my-4 p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <p>{error}</p>
            </div>
          )}
          {!error && articles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>发布日期</TableHead>
                  <TableHead className="text-center"><Eye className="inline h-4 w-4" /></TableHead>
                  <TableHead className="text-center"><Heart className="inline h-4 w-4" /></TableHead>
                  <TableHead className="text-center"><MessageCircle className="inline h-4 w-4" /></TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.slug}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>
                      <ArticleDateCell dateString={article.date} />
                    </TableCell>
                    <TableCell className="text-center">{article.views || 0}</TableCell>
                    <TableCell className="text-center">{article.likes || 0}</TableCell>
                    <TableCell className="text-center">{article.comments?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/articles/edit/${article.slug}`}>
                          <Pencil className="mr-2 h-4 w-4" /> 编辑
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && <p className="text-muted-foreground text-center py-8">暂无文章。点击“新建文章”开始创作吧！</p>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">共 {articles.length} 篇文章。</p>
        </CardFooter>
      </Card>
    </div>
  );
}
