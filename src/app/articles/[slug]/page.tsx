
'use client';

import { useEffect, useState, use, useRef } from 'react';
import type { Article, Comment as CommentType } from '@/lib/articles';
import { getArticleBySlug, getAllArticles } from '@/lib/articles'; // Assuming these will call a backend
import { notFound, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ReadAloudButton } from '@/components/ReadAloudButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// import { Input } from '@/components/ui/input'; // Guest input removed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Eye, Tag, Clock, BookOpen, Send, Trash2, Ban, MessageSquare, ChevronDown, ChevronUp, LogIn, UserPlus, List } from 'lucide-react';
import { remark } from 'remark';
import html from 'remark-html';
import { useToast } from "@/hooks/use-toast";

interface ArticlePageServerProps {
  params: Promise<{ slug: string }>;
}

interface ArticleParams {
  slug: string;
}

interface ReplyToComment {
  commentId: string;
  userName: string;
}

interface CommentWithChildren extends CommentType {
  children: CommentWithChildren[];
}

// These would ideally come from backend roles
const ADMIN_USERNAME_PLACEHOLDER = "root"; 
const EDITOR_USERNAME_PLACEHOLDER = "editor"; 
// const BLOCKED_WORDS = ['坏话', '脏话', '他妈的', '垃圾评论']; // Content moderation is a backend concern

interface CommentItemProps {
  comment: CommentWithChildren;
  isBlogOwnerView: boolean; // Based on loggedInUser matching ADMIN_USERNAME_PLACEHOLDER
  onDeleteComment: (commentId: string) => void; // Will simulate backend call
  onBanUser: (userId: string, userName: string) => void; // Will simulate backend call
  onLikeComment: (commentId: string) => void; // Will simulate backend call
  likedCommentIds: Set<string>; // Client-side state for optimistic UI
  collapsedReplyThreadIds: Set<string>;
  onToggleReplyThreadCollapse: (commentId: string) => void;
  currentLoggedInUser: string | null;
}

function CommentItem({
  comment,
  isBlogOwnerView,
  onDeleteComment,
  onBanUser,
  onLikeComment,
  onReplyToComment,
  likedCommentIds,
  collapsedReplyThreadIds,
  onToggleReplyThreadCollapse,
  currentLoggedInUser,
}: CommentItemProps) {
  const [formattedCommentDate, setFormattedCommentDate] = useState<string | null>(null);

  useEffect(() => {
    if (comment.date) {
      setFormattedCommentDate(
        new Date(comment.date).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
  }, [comment.date]);

  let userDisplay: React.ReactNode = comment.user;
  let userSuffixBadge: React.ReactNode = null;

  if (comment.user === ADMIN_USERNAME_PLACEHOLDER) {
    userDisplay = (
      <Badge className="bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200 px-2 py-0.5 text-xs">
        博主
      </Badge>
    );
  } else if (comment.user === EDITOR_USERNAME_PLACEHOLDER) {
    userDisplay = comment.user;
    userSuffixBadge = (
      <Badge variant="outline" className="ml-1.5 bg-green-100 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600 px-2 py-0.5 text-xs">
        编辑
      </Badge>
    );
  } else { 
    userDisplay = comment.user;
    // For generic registered users, could have a default badge or no badge
    // For now, let's keep the purple "用户" badge for non-admin/editor logged-in users
    if (currentLoggedInUser) {
         userSuffixBadge = (
            <Badge variant="outline" className="ml-1.5 bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-800 dark:text-purple-200 dark:border-purple-600 px-2 py-0.5 text-xs">
                用户
            </Badge>
        );
    }
  }

  const isTopLevelComment = !comment.parentId;
  const hasReplies = comment.children && comment.children.length > 0;
  const areOwnRepliesCollapsed = isTopLevelComment && hasReplies && collapsedReplyThreadIds.has(comment.id);
  const isLikedByCurrentUser = likedCommentIds.has(comment.id);
  // const showBlogOwnerLikedText = isBlogOwnerView && isLikedByCurrentUser; // Simplified this a bit

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.avatarUrl || `https://placehold.co/40x40.png?text=${comment.user.charAt(0).toUpperCase()}`} alt={comment.user} data-ai-hint="user avatar" />
            <AvatarFallback>{comment.user.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground flex items-center">
                {userDisplay}
                {userSuffixBadge}
              </div>
              <p className="text-xs text-muted-foreground">
                {formattedCommentDate || <span className="opacity-50">加载日期...</span>}
              </p>
            </div>
            <p className="text-sm text-foreground/90 mt-1 break-words whitespace-pre-wrap">{comment.text}</p>
            <div className="mt-3 flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => onLikeComment(comment.id)}>
                <Heart className={`mr-1 h-4 w-4 ${isLikedByCurrentUser ? 'text-red-500 fill-red-500' : ''}`} />
                {comment.likes || 0}
                {/* {showBlogOwnerLikedText && (
                  <span className="ml-1.5 text-xs text-primary font-semibold">(博主觉得很赞)</span>
                )} */}
              </Button>
              {currentLoggedInUser && ( 
                <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => onReplyToComment(comment.id, comment.user)}>
                  <MessageSquare className="mr-1 h-4 w-4" /> 回复
                </Button>
              )}

              {isBlogOwnerView && (
                <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => onDeleteComment(comment.id)}>
                  <Trash2 className="mr-1 h-3 w-3" /> 删除
                </Button>
              )}
              {isBlogOwnerView && comment.user !== ADMIN_USERNAME_PLACEHOLDER && comment.user !== EDITOR_USERNAME_PLACEHOLDER && (
                <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => onBanUser(comment.id, comment.user)}>
                  <Ban className="mr-1 h-3 w-3" /> 封禁
                </Button>
              )}
            </div>
          </div>
        </div>

        {isTopLevelComment && hasReplies && (
          <div className="mt-2 pl-12">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs px-2 py-1 h-auto text-muted-foreground hover:text-foreground"
              onClick={() => onToggleReplyThreadCollapse(comment.id)}
            >
              {areOwnRepliesCollapsed ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronUp className="mr-1 h-4 w-4" />}
              {areOwnRepliesCollapsed ? `展开回复 (${comment.children.length})` : `收起回复 (${comment.children.length})`}
            </Button>
          </div>
        )}

        {comment.children && comment.children.length > 0 && !areOwnRepliesCollapsed && (
          <div className="ml-6 md:ml-8 pl-4 border-l border-border/40 dark:border-border/60 mt-4 space-y-4">
            {comment.children.map(childComment => (
              <CommentItem
                key={childComment.id}
                comment={childComment}
                isBlogOwnerView={isBlogOwnerView}
                onDeleteComment={onDeleteComment}
                onBanUser={onBanUser}
                onLikeComment={onLikeComment}
                onReplyToComment={onReplyToComment}
                likedCommentIds={likedCommentIds}
                collapsedReplyThreadIds={collapsedReplyThreadIds}
                onToggleReplyThreadCollapse={onToggleReplyThreadCollapse}
                currentLoggedInUser={currentLoggedInUser}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function buildCommentTree(commentsList: CommentType[]): CommentWithChildren[] {
  const commentsById: Record<string, CommentWithChildren> = {};
  commentsList.forEach(comment => {
    commentsById[comment.id] = { ...comment, children: [] };
  });

  const tree: CommentWithChildren[] = [];
  commentsList.forEach(comment => {
    if (comment.parentId && commentsById[comment.parentId]) {
      commentsById[comment.parentId].children.push(commentsById[comment.id]);
    } else {
      tree.push(commentsById[comment.id]);
    }
  });

  const sortChildrenRecursive = (nodes: CommentWithChildren[]) => {
    nodes.forEach(node => {
      if (node.children.length > 0) {
        node.children.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        sortChildrenRecursive(node.children);
      }
    });
  };
  sortChildrenRecursive(tree);
  tree.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort top-level comments by date descending
  return tree;
}


export default function ArticlePage({ params: paramsPromise }: ArticlePageServerProps) {
  const params: ArticleParams = use(paramsPromise);
  const slug = params.slug;
  const router = useRouter();
  const currentPath = usePathname();

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [processedContent, setProcessedContent] = useState<string>('');
  const [plainTextContent, setPlainTextContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [articleLikes, setArticleLikes] = useState(0); // Optimistic UI
  const [isArticleLiked, setIsArticleLiked] = useState(false); // Optimistic UI

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<CommentType[]>([]); // Optimistic UI
  const [commentTree, setCommentTree] = useState<CommentWithChildren[]>([]);
  const [formattedArticleDate, setFormattedArticleDate] = useState<string | null>(null);

  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [isBlogOwner, setIsBlogOwner] = useState(false); // Based on loggedInUser matching ADMIN_USERNAME_PLACEHOLDER
  
  const { toast } = useToast();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set()); // Optimistic UI
  const [replyingToComment, setReplyingToComment] = useState<ReplyToComment | null>(null);
  const [collapsedReplyThreadIds, setCollapsedReplyThreadIds] = useState<Set<string>>(new Set());

  const popularEmojis = [
    '👍', '👎', '❤️', '😂', '🎉', '🙏', '😮', '😢', '🔥', '💯', 
    '👏', '🤝', '💡', '👌', '⭐', '😭', '🤯', '👀', '✨', '😊', 
    '🥳', '🙌', '💔', '😎', '😴', '🙄', '🤞', '💪', '🤔', '赞'
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userFromStorage = localStorage.getItem('loggedInUser');
      setLoggedInUser(userFromStorage);
      if (userFromStorage && userFromStorage === ADMIN_USERNAME_PLACEHOLDER) {
        setIsBlogOwner(true);
      } else {
        setIsBlogOwner(false);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchArticleData() {
      setIsLoading(true);
      setIsLoadingRelated(true);

      const fetchedArticle = await getArticleBySlug(slug);
      if (fetchedArticle) {
        setArticle(fetchedArticle);
        setArticleLikes(fetchedArticle.likes || 0);
        setComments(fetchedArticle.comments || []); // Comments would come from backend
        if (fetchedArticle.date) {
          setFormattedArticleDate(
            new Date(fetchedArticle.date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          );
        }
        const result = await remark().use(html).process(fetchedArticle.content);
        const htmlResult = result.toString();
        setProcessedContent(htmlResult);

        if (typeof window !== 'undefined') {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlResult;
          setPlainTextContent(tempDiv.textContent || tempDiv.innerText || "");
        } else {
          setPlainTextContent(fetchedArticle.content); // Fallback for server environment or if DOM not ready
        }
        
        // Fetch related articles - this would also be a backend call ideally
        const allArticles = await getAllArticles(); 
        const currentArticleTags = fetchedArticle.tags || [];
        
        let possibleRelated = allArticles.filter(a => a.slug !== fetchedArticle.slug);
        let scoredRelated: (Article & { score: number })[] = [];

        if (currentArticleTags.length > 0) {
            scoredRelated = possibleRelated.map(related => {
            const commonTags = related.tags?.filter(tag => currentArticleTags.includes(tag)) || [];
            return { ...related, score: commonTags.length };
          }).filter(related => related.score > 0);

          scoredRelated.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        }
        
        let finalRelated = scoredRelated.slice(0, 4);

        if (finalRelated.length < 4) {
          const recentArticles = possibleRelated
            .filter(a => !finalRelated.find(fr => fr.slug === a.slug)) 
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4 - finalRelated.length);
          finalRelated = [...finalRelated, ...recentArticles];
        }
        
        setRelatedArticles(finalRelated.slice(0,4)); 
      } else {
        notFound();
      }
      setIsLoading(false);
      setIsLoadingRelated(false);
    }
    if (slug) {
        fetchArticleData();
    } else {
        setIsLoading(false);
        setIsLoadingRelated(false);
        notFound();
    }
  }, [slug]);

  useEffect(() => {
    setCommentTree(buildCommentTree(comments));
  }, [comments]);


  const handleArticleLike = async () => {
    if (!loggedInUser) {
        toast({ title: "请先登录", description: "登录后才能点赞文章哦。", variant: "destructive"});
        return;
    }
    // Optimistic UI update
    const newIsLiked = !isArticleLiked;
    const newLikes = articleLikes + (newIsLiked ? 1 : -1);
    setIsArticleLiked(newIsLiked);
    setArticleLikes(newLikes);

    try {
      // Simulate API call
      // const response = await fetch(`/api/articles/${slug}/like`, { method: newIsLiked ? 'POST' : 'DELETE' });
      // if (!response.ok) throw new Error("Failed to update like status");
      // const data = await response.json();
      // setArticleLikes(data.likes); // Update with actual count from backend
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
      toast({ title: newIsLiked ? "文章已点赞！" : "已取消点赞", description: "您的操作已记录。" });
    } catch (error) {
      // Revert optimistic update on error
      setIsArticleLiked(!newIsLiked);
      setArticleLikes(articleLikes);
      toast({ title: "操作失败", description: "无法更新点赞状态，请稍后再试。", variant: "destructive" });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();

    if (!loggedInUser) {
        toast({ title: "请先登录", description: "登录后才能发表评论。", variant: "destructive"});
        return;
    }
    if (!trimmedComment) {
      toast({ title: "评论内容不能为空", description: "请输入您的评论。", variant: "destructive" });
      return;
    }

    // Content moderation (e.g., BLOCKED_WORDS) should be handled by the backend.
    // For now, it's removed from client-side.

    let commentTextForDisplay = trimmedComment;
    let parentId: string | null = null;

    if (replyingToComment) {
      commentTextForDisplay = `@${replyingToComment.userName} ${trimmedComment}`;
      parentId = replyingToComment.commentId;
    }
    
    const optimisticComment: CommentType = {
      id: `comment-temp-${Date.now()}`, // Temporary ID
      user: loggedInUser, // Use logged-in user
      text: commentTextForDisplay,
      date: new Date().toISOString(),
      avatarUrl: `https://placehold.co/40x40.png?text=${loggedInUser.charAt(0).toUpperCase()}`, // Placeholder avatar
      likes: 0,
      parentId: parentId,
    };

    setComments(prevComments => [optimisticComment, ...prevComments]); // Optimistic update
    setNewComment('');
    setReplyingToComment(null);

    try {
        // Simulate API call to submit comment
        // const response = await fetch(`/api/articles/${slug}/comments`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ text: commentTextForDisplay, parentId }),
        // });
        // if (!response.ok) throw new Error("Failed to submit comment");
        // const savedComment = await response.json();
        // setComments(prevComments => prevComments.map(c => c.id === optimisticComment.id ? savedComment : c)); // Replace temp with real
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        toast({ title: "评论已提交", description: "您的评论已成功发送。" });
    } catch (error) {
        setComments(prevComments => prevComments.filter(c => c.id !== optimisticComment.id)); // Revert optimistic update
        toast({ title: "评论失败", description: "无法提交评论，请稍后再试。", variant: "destructive" });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    // Optimistic UI update
    const originalComments = [...comments];
    const commentsToDelete = new Set<string>([commentId]);
    const queue = [commentId];
    while (queue.length > 0) {
      const currentParentId = queue.shift();
      originalComments.forEach(c => { // Check originalComments for children
        if (c.parentId === currentParentId) {
          commentsToDelete.add(c.id);
          queue.push(c.id);
        }
      });
    }
    setComments(prevComments => prevComments.filter(comment => !commentsToDelete.has(comment.id)));
    
    try {
        // Simulate API call
        // await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
        await new Promise(resolve => setTimeout(resolve, 300));
        toast({ title: "评论已删除", description: "该评论及其所有回复已移除。" });
    } catch (error) {
        setComments(originalComments); // Revert
        toast({ title: "删除失败", description: "无法删除评论。", variant: "destructive" });
    }
  };

  const handleBanUser = async (userId: string, userName: string) => {
    // This action would typically be restricted and call a secure backend endpoint.
    try {
        // Simulate API call
        // await fetch(`/api/users/${userId}/ban`, { method: 'POST' });
        await new Promise(resolve => setTimeout(resolve, 300));
        toast({
        title: "用户已“封禁”",
        description: `用户 ${userName} (ID: ${userId}) 已被标记为封禁。`,
        variant: "default" // Changed from destructive as it's a successful admin action
        });
    } catch (error) {
        toast({ title: "封禁失败", description: "操作失败。", variant: "destructive"});
    }
  };

  const handleLikeComment = async (commentId: string) => {
     if (!loggedInUser) {
        toast({ title: "请先登录", description: "登录后才能点赞评论哦。", variant: "destructive"});
        return;
    }
    // Optimistic UI update
    const originalComments = comments.map(c => ({...c}));
    const newLikedIds = new Set(likedCommentIds);
    const alreadyLiked = newLikedIds.has(commentId);
    
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: (comment.likes || 0) + (alreadyLiked ? -1 : 1),
          };
        }
        return comment;
      })
    );

    if (alreadyLiked) {
        newLikedIds.delete(commentId);
    } else {
        newLikedIds.add(commentId);
    }
    setLikedCommentIds(newLikedIds);

    try {
        // Simulate API Call
        // await fetch(`/api/comments/${commentId}/like`, {method: alreadyLiked ? 'DELETE' : 'POST'});
        await new Promise(resolve => setTimeout(resolve, 200));
        // No toast here for like/unlike to keep UI less noisy, or a very subtle one.
    } catch (error) {
        setComments(originalComments); // Revert
        setLikedCommentIds(likedCommentIds);
        toast({title: "操作失败", description: "点赞评论失败。", variant: "destructive"});
    }
  };

  const handleStartReply = (commentId: string, userName: string) => {
    setReplyingToComment({ commentId, userName });
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelReply = () => {
    setReplyingToComment(null);
    setNewComment('');
  };

  const handleToggleReplyThreadCollapse = (commentId: string) => {
    setCollapsedReplyThreadIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleEmojiClick = (emoji: string) => {
    setNewComment(prevComment => prevComment + emoji);
    commentInputRef.current?.focus();
  };
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('loggedInUser');
    }
    setLoggedInUser(null);
    setIsBlogOwner(false);
    toast({ title: "已登出", description: "您已成功退出登录。" });
  };


  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
                <Card className="glassmorphic glassmorphic-fallback-noise shadow-xl overflow-hidden">
                    <CardHeader className="p-0">
                    <div className="relative w-full h-72 md:h-96 bg-muted animate-pulse"></div>
                    <div className="p-6 md:p-8">
                        <div className="h-10 bg-muted rounded w-3/4 mb-4 animate-pulse"></div>
                        <div className="h-6 bg-muted rounded w-1/2 animate-pulse"></div>
                    </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-6 md:p-8">
                    <div className="space-y-4">
                        <div className="h-6 bg-muted rounded w-full animate-pulse"></div>
                        <div className="h-6 bg-muted rounded w-5/6 animate-pulse"></div>
                        <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                    </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:w-1/4 space-y-6">
                 <Card className="glassmorphic glassmorphic-fallback-noise shadow-lg animate-pulse">
                    <CardHeader>
                        <div className="h-8 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="h-5 bg-muted rounded w-full"></div>
                        <div className="h-5 bg-muted rounded w-5/6"></div>
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    );
  }

  if (!article) {
     // This case should be handled by notFound() if getArticleBySlug returns undefined
     // but as a fallback:
    return (
        <div className="container mx-auto py-12 text-center">
            <h1 className="text-3xl font-bold">文章未找到</h1>
            <p className="mt-4 text-muted-foreground">抱歉，我们无法找到您请求的文章。</p>
            <Button asChild className="mt-6">
                <Link href="/">返回首页</Link>
            </Button>
        </div>
    );
  }
  
  const loginLink = `/login?redirectUrl=${encodeURIComponent(currentPath)}`;
  const registerLink = `/register?redirectUrl=${encodeURIComponent(currentPath)}`;

  return (
    <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
                <Card className="glassmorphic glassmorphic-fallback-noise shadow-xl overflow-hidden animate-genie-in">
                    <CardHeader className="p-0">
                    {article.imageUrl && (
                        <div className="relative w-full h-72 md:h-96">
                        <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            style={{objectFit: 'cover'}}
                            priority
                            data-ai-hint={article.aiHint || "article hero"}
                        />
                        </div>
                    )}
                    <div className="p-6 md:p-8">
                        <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
                        {article.title}
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                        发布于 {formattedArticleDate || <span className="opacity-50">加载日期...</span>}
                        </CardDescription>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" /> <span>{article.views || 0} 次浏览</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Heart className={`h-4 w-4 ${isArticleLiked ? 'text-red-500 fill-red-500' : ''}`} /> <span>{articleLikes} 次点赞</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" /> <span>约 {article.wordCount || 0} 字</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" /> <span>阅读约 {article.readingTime || 0} 分钟</span>
                        </div>
                        </div>
                        {article.tags && article.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Tag className="h-5 w-5 text-muted-foreground self-center" />
                            {article.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-sm">{tag}</Badge>
                            ))}
                        </div>
                        )}
                    </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-6 md:p-8">
                    <article className="prose dark:prose-invert prose-lg max-w-none mb-8"
                        dangerouslySetInnerHTML={{ __html: processedContent }}
                    />
                    <div className="flex items-center space-x-4 mb-8">
                        <Button onClick={handleArticleLike} variant="outline" className="button-spring">
                        <Heart className={`mr-2 h-5 w-5 ${isArticleLiked ? 'text-red-500 fill-red-500' : ''}`} /> {isArticleLiked ? '取消点赞' : '点赞'} ({articleLikes})
                        </Button>
                        <ReadAloudButton textToRead={plainTextContent} />
                    </div>

                    <Separator className="my-8" />

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-semibold font-headline flex items-center">
                            <MessageCircle className="mr-3 h-6 w-6" /> 评论区 ({comments.length})
                            </h3>
                            {loggedInUser && (
                                <Button variant="outline" size="sm" onClick={handleLogout}>登出 ({loggedInUser})</Button>
                            )}
                        </div>
                        
                        {loggedInUser ? (
                            <>
                                {replyingToComment && (
                                <div className="mb-2 p-3 bg-muted/50 rounded-md text-sm">
                                    正在回复: <strong>@{replyingToComment.userName}</strong>
                                    <Button variant="link" size="sm" onClick={handleCancelReply} className="ml-2 text-xs text-destructive hover:underline">
                                    取消回复
                                    </Button>
                                </div>
                                )}
                                <form onSubmit={handleCommentSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="commentText" className="text-sm font-medium text-foreground">
                                    {replyingToComment ? `回复 @${replyingToComment.userName}` :
                                    (loggedInUser === ADMIN_USERNAME_PLACEHOLDER ? `以 博主 (${ADMIN_USERNAME_PLACEHOLDER}) 身份评论` : 
                                    (loggedInUser === EDITOR_USERNAME_PLACEHOLDER ? `以 编辑 (${EDITOR_USERNAME_PLACEHOLDER}) 身份评论` : `以 ${loggedInUser} 身份评论`))}
                                    </label>
                                    <Textarea
                                    id="commentText"
                                    ref={commentInputRef}
                                    placeholder={replyingToComment ? `回复 @${replyingToComment.userName}...` : "在此输入您的评论..."}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={3}
                                    required
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {popularEmojis.map((emoji, index) => (
                                    <Button
                                        key={`emoji-${index}`}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="px-2 py-1 h-auto text-lg"
                                        aria-label={`选择表情符号 ${emoji}`}
                                    >
                                        {emoji}
                                    </Button>
                                    ))}
                                </div>
                                <Button type="submit" className="button-spring">
                                    <Send className="mr-2 h-4 w-4" /> {replyingToComment ? '提交回复' : '提交评论'}
                                </Button>
                                </form>
                            </>
                        ) : ( 
                            <Card className="p-6 text-center bg-muted/30">
                                <CardTitle className="text-xl mb-3">加入讨论！</CardTitle>
                                <CardDescription className="mb-4">
                                    请 <Link href={loginLink} className="text-primary hover:underline"><LogIn className="inline h-4 w-4 mr-1"/>登录</Link> 或 
                                    <Link href={registerLink} className="text-primary hover:underline ml-1"><UserPlus className="inline h-4 w-4 mr-1"/>注册</Link> 后发表评论。
                                </CardDescription>
                            </Card>
                        )}


                        <div className="space-y-6">
                        {commentTree.length > 0 ? commentTree.map((commentNode) => (
                            <CommentItem
                            key={commentNode.id}
                            comment={commentNode}
                            isBlogOwnerView={isBlogOwner}
                            onDeleteComment={handleDeleteComment}
                            onBanUser={handleBanUser}
                            onLikeComment={handleLikeComment}
                            onReplyToComment={handleStartReply}
                            likedCommentIds={likedCommentIds}
                            collapsedReplyThreadIds={collapsedReplyThreadIds}
                            onToggleReplyThreadCollapse={handleToggleReplyThreadCollapse}
                            currentLoggedInUser={loggedInUser}
                            />
                        )) : (
                            <p className="text-muted-foreground py-4 text-center">{loggedInUser ? "暂无评论，快来抢沙发吧！" : "登录后查看或发表评论。"}</p>
                        )}
                        </div>
                    </div>
                    </CardContent>
                    {/* Footer removed as it mentioned simulation */}
                </Card>
            </div>
            <aside className="lg:w-1/4 space-y-6 sticky top-24 h-fit">
                <Card className="glassmorphic glassmorphic-fallback-noise shadow-lg animate-genie-in" style={{ animationDelay: '0.2s' }}>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline flex items-center">
                           <List className="mr-2 h-5 w-5 text-primary"/> 相关文章
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingRelated ? (
                             <div className="space-y-3">
                                <div className="h-5 bg-muted rounded w-full animate-pulse"></div>
                                <div className="h-5 bg-muted rounded w-5/6 animate-pulse"></div>
                                <div className="h-5 bg-muted rounded w-3/4 animate-pulse"></div>
                            </div>
                        ) : relatedArticles.length > 0 ? (
                            <ul className="space-y-3">
                            {relatedArticles.map(related => (
                                <li key={related.slug}>
                                <Link href={`/articles/${related.slug}`} className="text-foreground hover:text-primary transition-colors duration-200 ease-in-out group block">
                                    <span className="font-medium group-hover:underline">{related.title}</span>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{related.excerpt}</p>
                                </Link>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">暂无相关文章。</p>
                        )}
                    </CardContent>
                </Card>
            </aside>
        </div>
    </div>
  );
}
