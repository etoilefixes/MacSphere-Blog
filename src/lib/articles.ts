
export interface Comment {
  id: string; // Unique ID for each comment
  user: string;
  text: string;
  date: string;
  avatarUrl?: string;
  likes?: number; // Number of likes for the comment
  parentId?: string | null; // ID of the parent comment if this is a reply
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Full markdown content
  imageUrl: string;
  date: string;
  aiHint?: string; // For placeholder images
  tags?: string[];
  wordCount?: number;
  readingTime?: number; // in minutes
  views?: number;
  likes?: number;
  comments?: Comment[];
  isPinned?: boolean;
}

// const AVERAGE_WORDS_PER_MINUTE = 200;

// function calculateWordCount(text: string): number {
//   if (!text) return 0;
//   return text.trim().split(/\s+/).length;
// }

// function calculateReadingTime(wordCount: number): number {
//   if (!wordCount || wordCount === 0) return 0;
//   return Math.ceil(wordCount / AVERAGE_WORDS_PER_MINUTE);
// }

// Removed mock articlesData array. Data will now come from a backend.

export async function getAllArticles(): Promise<Article[]> {
  // In a real application, this would fetch articles from a backend API.
  // Example: const response = await fetch('/api/articles');
  // const data = await response.json();
  // return data;
  console.warn("getAllArticles: Fetching from backend not implemented. Returning empty array.");
  return Promise.resolve([]);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  // In a real application, this would fetch a single article by slug from a backend API.
  // Example: const response = await fetch(`/api/articles/${slug}`);
  // if (!response.ok) return undefined;
  // const data = await response.json();
  // return data;
  console.warn(`getArticleBySlug: Fetching article '${slug}' from backend not implemented. Returning undefined.`);
  return Promise.resolve(undefined);
}

// Define a type for the properties that can be passed when creating an article
export type CreateArticleFormInput = {
  title: string;
  excerpt: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  slug?: string;
  imageUrl?: string;
  aiHint?: string;
};

export async function createArticle(newArticleData: CreateArticleFormInput): Promise<Article | null> {
  // In a real application, this would send data to a backend API to create an article.
  // Example: const response = await fetch('/api/articles', { method: 'POST', body: JSON.stringify(newArticleData), headers: {'Content-Type': 'application/json'} });
  // if (!response.ok) return null;
  // const data = await response.json();
  // return data;
  console.warn("createArticle: Backend integration not implemented. Simulating failure.");
  // Simulate an API call failure or return null to indicate it's not implemented
  return Promise.resolve(null);
}

export async function updateArticle(updatedArticleData: Article): Promise<Article | null> {
  // In a real application, this would send data to a backend API to update an article.
  // Example: const response = await fetch(`/api/articles/${updatedArticleData.slug}`, { method: 'PUT', body: JSON.stringify(updatedArticleData), headers: {'Content-Type': 'application/json'} });
  // if (!response.ok) return null;
  // const data = await response.json();
  // return data;
  console.warn(`updateArticle: Backend integration for article '${updatedArticleData.slug}' not implemented. Simulating failure.`);
  // Simulate an API call failure
  return Promise.resolve(null);
}

// Similar stubs would be needed for comments, likes, etc.
// For example:
// export async function addCommentToArticle(slug: string, commentData: Omit<Comment, 'id' | 'date' | 'avatarUrl'>): Promise<Comment | null> {
//   console.warn(`addCommentToArticle: Backend integration for article '${slug}' not implemented.`);
//   return Promise.resolve(null);
// }

// export async function likeArticle(slug: string): Promise<{ likes: number } | null> {
//   console.warn(`likeArticle: Backend integration for article '${slug}' not implemented.`);
//   return Promise.resolve(null);
// }

// export async function likeComment(commentId: string): Promise<{ likes: number } | null> {
//   console.warn(`likeComment: Backend integration for comment '${commentId}' not implemented.`);
//   return Promise.resolve(null);
// }
