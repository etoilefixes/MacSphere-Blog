
'use client';

import type { HTMLAttributes } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/lib/articles';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Tag, Pin } from 'lucide-react'; // Added Pin icon
import React, { useEffect, useState } from 'react';

interface ArticleCardProps extends HTMLAttributes<HTMLDivElement> {
  article: Article;
}

export function ArticleCard({ article, className, style }: ArticleCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (article.date) {
      setFormattedDate(
        new Date(article.date).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    }
  }, [article.date]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };


  return (
    <div
      ref={cardRef}
      className={cn(
        'glassmorphic rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ease-out card-tilt transform-style-3d glassmorphic-fallback-noise group flex flex-col',
        className
      )}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/articles/${article.slug}`} className="block flex flex-col flex-grow">
        <div className="relative w-full h-48">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            style={{objectFit: 'cover'}}
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={article.aiHint}
          />
          {article.isPinned && (
            <Badge 
              variant="default" 
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary/90 text-primary-foreground backdrop-blur-sm px-2 py-1 shadow-lg"
            >
              <Pin className="h-3.5 w-3.5" />
              置顶
            </Badge>
          )}
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-2xl font-semibold mb-2 text-foreground font-headline group-hover:text-interactive transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground mb-3 text-sm line-clamp-3 flex-grow">
            {article.excerpt}
          </p>
          {article.tags && article.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 items-center">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {article.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/20">
             <span className="text-xs text-muted-foreground">
               {formattedDate || <span className="opacity-50">...</span>}
             </span>
            <Button variant="link" className="p-0 h-auto text-interactive group-hover:underline">
              阅读更多 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}
