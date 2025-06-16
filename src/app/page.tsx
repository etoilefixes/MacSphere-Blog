
'use client';

import { useEffect, useState } from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import type { Article } from '@/lib/articles';
import { getAllArticles } from '@/lib/articles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, SortAsc, XCircle, ListFilter } from 'lucide-react';

type SortOption = 'date-desc' | 'date-asc' | 'popularity-desc';

export default function HomePage() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticles() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedArticles = await getAllArticles();
        setAllArticles(fetchedArticles);

        const tags = new Set<string>();
        fetchedArticles.forEach(article => {
          article.tags?.forEach(tag => tags.add(tag));
        });
        setAvailableTags(Array.from(tags).sort());
      } catch (e) {
        console.error("Failed to load articles:", e);
        setError("无法加载文章列表。请稍后再试。");
      }
      setIsLoading(false);
    }
    loadArticles();
  }, []);

  useEffect(() => {
    let articlesToProcess = [...allArticles];

    const pinnedArticles = articlesToProcess.filter(article => article.isPinned);
    let regularArticles = articlesToProcess.filter(article => !article.isPinned);

    if (selectedTag) {
      regularArticles = regularArticles.filter(article =>
        article.tags?.includes(selectedTag)
      );
    }

    switch (sortOption) {
      case 'date-asc':
        regularArticles.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'popularity-desc':
        regularArticles.sort((a, b) => {
          const popularityA = (a.views || 0) + (a.likes || 0) * 3;
          const popularityB = (b.views || 0) + (b.likes || 0) * 3;
          return popularityB - popularityA;
        });
        break;
      case 'date-desc':
      default:
        regularArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    
    pinnedArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setDisplayedArticles([...pinnedArticles, ...regularArticles]);
  }, [allArticles, selectedTag, sortOption]);

  const handleTagSelect = (tag: string) => {
    setSelectedTag(prevTag => (prevTag === tag ? null : tag));
  };

  const clearTagFilter = () => {
    setSelectedTag(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <header className="text-center py-8 md:py-12">
          <div className="h-10 md:h-12 bg-muted rounded w-3/4 mx-auto animate-pulse mb-3 md:mb-4"></div>
          <div className="h-6 md:h-8 bg-muted rounded w-1/2 mx-auto animate-pulse"></div>
        </header>
        <Card className="p-4 md:p-6 glassmorphic glassmorphic-fallback-noise shadow-md animate-pulse">
           <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
             <div className="h-8 bg-muted rounded w-1/3"></div>
             <div className="h-10 bg-muted rounded w-1/2 sm:w-[180px]"></div>
           </div>
           <div className="mt-4 pt-4 border-t border-border/30">
             <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
             <div className="flex flex-wrap gap-2">
                <div className="h-7 bg-muted rounded-full w-16"></div>
                <div className="h-7 bg-muted rounded-full w-20"></div>
                <div className="h-7 bg-muted rounded-full w-12"></div>
             </div>
           </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <Card key={i} className="glassmorphic glassmorphic-fallback-noise animate-pulse">
              <div className="relative w-full h-48 bg-muted"></div>
              <CardContent className="p-6 space-y-3">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/20">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-headline animate-genie-in">
          欢迎来到 MacSphere 博客
        </h1>
         <p className="mt-6 text-xl text-destructive">{error}</p>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <header className="text-center py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-headline animate-genie-in">
          欢迎来到 MacSphere 博客
        </h1>
        <p className="mt-3 md:mt-4 text-lg md:text-xl text-muted-foreground animate-genie-in" style={{ animationDelay: '0.2s' }}>
          以 macOS 的优雅风格，探索前端艺术。
        </p>
      </header>

      <Card className="glassmorphic glassmorphic-fallback-noise shadow-lg animate-genie-in" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl md:text-2xl">筛选与排序</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[200px] bg-background/70 hover:bg-accent/70 transition-colors">
                <SortAsc className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">最新发布</SelectItem>
                <SelectItem value="date-asc">最早发布</SelectItem>
                <SelectItem value="popularity-desc">最受欢迎</SelectItem>
              </SelectContent>
            </Select>
             {selectedTag && (
              <Button variant="outline" size="sm" onClick={clearTagFilter} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 border-destructive/50 button-spring w-full sm:w-auto">
                <XCircle className="h-4 w-4 mr-1.5" /> 清除筛选: {selectedTag}
              </Button>
            )}
          </div>
          {availableTags.length > 0 && (
            <div className="pt-3 border-t border-border/30">
              <p className="text-sm font-medium text-muted-foreground mb-2.5 flex items-center">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                按标签筛选:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'secondary'}
                    onClick={() => handleTagSelect(tag)}
                    className="cursor-pointer transition-all hover:opacity-80 active:scale-95 text-sm px-3 py-1.5 rounded-md shadow-sm hover:shadow-md"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {displayedArticles.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedArticles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              className="animate-genie-in"
              style={{ animationDelay: `${0.4 + index * 0.08}s` }}
            />
          ))}
        </section>
      ) : (
        <div className="text-center py-12 animate-genie-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-xl text-muted-foreground mb-3">
            {selectedTag ? `抱歉，没有找到标签为 "${selectedTag}" 的文章。` : "当前暂无文章。"}
          </p>
          {selectedTag && (
             <Button variant="link" onClick={clearTagFilter} className="text-lg">
                查看所有文章
              </Button>
          )}
        </div>
      )}
    </div>
  );
}
