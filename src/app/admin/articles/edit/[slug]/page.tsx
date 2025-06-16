
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getArticleBySlug, updateArticle, createArticle, type Article, type CreateArticleFormInput } from '@/lib/articles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

const articleFormSchema = z.object({
  title: z.string().min(3, { message: "标题至少需要3个字符。" }),
  excerpt: z.string().min(10, { message: "摘要至少需要10个字符。" }),
  content: z.string().min(20, { message: "内容至少需要20个字符。" }),
  tags: z.string().optional(),
  isPinned: z.boolean().optional(),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slugParam = params.slug as string;
  const { toast } = useToast();
  
  // No longer storing full article object in state, form will hold the data.
  // const [article, setArticle] = useState<Article | null>(null); 
  const [currentArticleSlug, setCurrentArticleSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isNewArticle = slugParam === 'new';

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      tags: '',
      isPinned: false,
    },
  });

  useEffect(() => {
    setError(null);
    if (!isNewArticle) {
      async function loadArticle() {
        setIsLoading(true);
        try {
          const fetchedArticle = await getArticleBySlug(slugParam);
          if (fetchedArticle) {
            setCurrentArticleSlug(fetchedArticle.slug);
            form.reset({
              title: fetchedArticle.title,
              excerpt: fetchedArticle.excerpt,
              content: fetchedArticle.content,
              tags: fetchedArticle.tags?.join(', ') || '',
              isPinned: fetchedArticle.isPinned || false,
            });
          } else {
            toast({ title: "错误", description: "未找到文章。", variant: "destructive" });
            setError("无法加载文章数据。该文章可能不存在。");
            // router.push('/admin/articles'); // Or display error on page
          }
        } catch (e) {
            console.error("Failed to load article:", e);
            setError("加载文章时出错。请检查网络连接或后端服务。");
            toast({ title: "加载错误", description: "无法加载文章数据。", variant: "destructive" });
        }
        setIsLoading(false);
      }
      loadArticle();
    } else {
      form.reset({ title: '', excerpt: '', content: '', tags: '', isPinned: false });
      setCurrentArticleSlug(null);
      setIsLoading(false);
    }
  }, [slugParam, form, router, toast, isNewArticle]);

  async function onSubmit(data: ArticleFormData) {
    setIsSaving(true);
    setError(null);
    toast({ title: "正在保存...", description: "请稍候。" });

    const articleDataPayload: CreateArticleFormInput & { slug?: string } = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
      isPinned: data.isPinned || false,
    };
    
    try {
        if (isNewArticle) {
        const createdArticle = await createArticle(articleDataPayload);
        if (createdArticle && createdArticle.slug) {
            toast({
            title: "文章已创建",
            description: `文章 "${createdArticle.title}" 已成功创建。`,
            variant: "default",
            duration: 5000,
            });
            router.push(`/admin/articles/edit/${createdArticle.slug}`); // Navigate to edit page of new article
        } else {
            throw new Error("创建文章失败，服务器未能返回有效的文章数据。");
        }
        } else if (currentArticleSlug) {
        // For update, the slug is part of the Article type for updateArticle function
        const updatePayload: Article = {
            ...articleDataPayload,
            slug: currentArticleSlug,
            // These would ideally come from the existing article or be part of form
            date: new Date().toISOString(), // Or keep existing date
            imageUrl: 'https://placehold.co/600x400.png', // Or manage image upload
            views: 0, // Or keep existing
            likes: 0, // Or keep existing
            comments: [], // Or keep existing
          };
        const updatedArticle = await updateArticle(updatePayload);
        if (updatedArticle) {
            toast({
            title: "文章已更新",
            description: "文章更改已成功保存。",
            variant: "default",
            duration: 5000,
            });
            // Optionally re-fetch or update form if backend returns slightly different data
            form.reset({ // Re-populate form with potentially sanitized/updated data from backend
              title: updatedArticle.title,
              excerpt: updatedArticle.excerpt,
              content: updatedArticle.content,
              tags: updatedArticle.tags?.join(', ') || '',
              isPinned: updatedArticle.isPinned || false,
            });

        } else {
            throw new Error("更新文章失败，服务器未能确认更新。");
        }
        } else {
            throw new Error("无法确定要更新的文章。");
        }
    } catch (e: any) {
        console.error("Save failed:", e);
        setError(e.message || "保存文章时发生未知错误。");
        toast({ title: "保存失败", description: e.message || "无法保存文章，请检查后端服务。", variant: "destructive" });
    }
    
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="glassmorphic">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">正在加载编辑器...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted rounded w-full animate-pulse"></div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-genie-in">
      <Card className="glassmorphic glassmorphic-fallback-noise shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-headline">
              {isNewArticle ? "撰写新文章" : `编辑文章: ${form.getValues('title') || '加载中...'}`}
            </CardTitle>
            <Button variant="outline" onClick={() => router.push('/admin/articles')} className="button-spring">
              <ArrowLeft className="mr-2 h-4 w-4" /> 返回列表
            </Button>
          </div>
          <CardDescription>
            {isNewArticle ? "填写以下表单以创建一篇新文章。" : "修改文章内容，然后点击保存。"}
          </CardDescription>
        </CardHeader>
        {error && (
            <CardContent>
                <div className="my-4 p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive flex items-center gap-3">
                <AlertTriangle className="h-6 w-6" />
                <p>{error}</p>
                </div>
            </CardContent>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input placeholder="文章标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>摘要</FormLabel>
                    <FormControl>
                      <Textarea placeholder="文章摘要，会显示在列表页" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内容 (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="使用 Markdown 格式编写文章内容..." {...field} rows={15} />
                    </FormControl>
                    <FormDescription>
                      支持标准的 Markdown 语法。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：技术, AI, 教程" {...field} />
                    </FormControl>
                    <FormDescription>
                      多个标签请用英文逗号分隔。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPinned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">置顶文章</FormLabel>
                      <FormDescription>
                        如果选中，此文章将始终显示在首页文章列表的顶部。
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isSaving || isLoading} className="button-spring">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "保存中..." : (isNewArticle ? "创建文章" : "保存更改")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-md text-sm text-blue-700 dark:text-blue-200">
          <strong>开发者提示：</strong> 文章的创建、更新和读取操作需要与后端服务集成。当前表单提交后会模拟API调用。
      </div>
    </div>
  );
}
