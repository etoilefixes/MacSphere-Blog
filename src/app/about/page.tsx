
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 animate-genie-in">
      <Card className="glassmorphic glassmorphic-fallback-noise shadow-lg">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center font-headline">关于 MacSphere 博客</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert prose-lg max-w-none text-foreground/90">
          <p>
            MacSphere 博客是一个展示现代前端技术的项目，其灵感来源于 macOS 的美学设计。我们的目标是展示如何利用最新的 Web 标准和创新的设计原则来打造优雅且高性能的用户界面。
          </p>
          <p>
            本博客探讨各种主题，包括：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>用于实现动画和玻璃拟态等效果的高级 CSS 技术。</li>
            <li>动态主题和色彩系统，可能由 AI 驱动。</li>
            <li>实现复杂的交互和空间动态效果。</li>
            <li>利用现代 JavaScript API 增强用户体验。</li>
          </ul>
          <p>
            我们坚信要突破 Web 的可能性边界，同时注重代码的简洁性、可访问性和性能。
          </p>
          <p>
            感谢您的访问！
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
