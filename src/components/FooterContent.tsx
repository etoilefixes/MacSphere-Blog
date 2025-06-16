
'use client';

import { useState, useEffect } from 'react';

export function FooterContent() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-8 text-center text-sm text-muted-foreground">
      <p>
        &copy; {currentYear !== null ? currentYear : new Date().getFullYear()} MacSphere 博客。版权所有。
      </p>
      <p className="mt-1 text-xs text-muted-foreground/80">
        本项目需要与后端服务集成以实现完整的用户认证、数据持久化和安全功能。
      </p>
    </footer>
  );
}
